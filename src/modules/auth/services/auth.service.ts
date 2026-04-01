import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from 'modules/user/services/user.service';
import { CreateUserGoogleDto, InfoUserDto } from 'modules/user/dtos';
import { env } from 'configs';
import { AppConfig } from 'common/constants';
import { comparePassword, generateOtp, hashPassword, hashToken } from 'shared/utils';
import { IUserRequest } from 'shared/interfaces';
import { RoleService } from 'modules/role/services/role.service';
import { EmailProducer } from 'modules/queue/producers';

import { AuthRepository } from '../repositories/auth.repository';
import { ForgotPasswordDto, OtpDto, PasswordDto, RegisterUserDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
    private readonly authRepo: AuthRepository,
    private readonly emailProducer: EmailProducer
  ) {}
  async validateGoogleUser(googleUserDto: CreateUserGoogleDto) {
    const { email, googleId, username } = googleUserDto;

    // Tìm user theo googleId
    let user = await this.userService.findByGoogleId(googleId);

    if (!user) {
      // tìm thử user bằng email nếu ko tìm thấy bằng googleId
      user = await this.userService.findByEmail(email);

      if (user) {
        const userUpdated = await this.userService.updateUserGoogle(user._id.toString(), { googleId });
        if (userUpdated) user = userUpdated;
      } else {
        user = await this.userService.createUserGoodle({ email, googleId, username });
      }
    }

    // 2. Tạo access token & refresh token
    const payload = {
      sub: user._id.toString(),
      username: user.username,
      isPremium: user.isPremium,
      roleId: user.roleId.toString()
    };
    const refreshToken = await this.generateRefreshTokenResponse(payload);
    const accessToken = await this.jwtService.sign(payload);

    return {
      user,
      refreshToken,
      accessToken
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const [userByEmail, userByUsername] = await Promise.all([
      this.userService.existUserByEmail(registerUserDto.email),
      this.userService.existUserByUsername(registerUserDto.username)
    ]);

    if (userByEmail || userByUsername) throw new BadRequestException('Email hoặc username đã tồn tại');

    await this.userService.createUserLocal(registerUserDto);
  }

  async login(user: IUserRequest, response: Response) {
    const { userId, username, roleId, isPremium } = user;
    const payload = {
      sub: userId.toString(),
      username,
      roleId,
      isPremium,
      jti: uuidv4()
    };
    const refreshToken = await this.generateRefreshTokenResponse(payload);

    const expireStr = env.JWT_REFRESH_TOKEN_EXPIRE || AppConfig.JWT.JWT_REFRESH_TOKEN_EXPIRE;
    const isProd = (env.NODE_ENV ?? process.env.NODE_ENV ?? 'dev') === 'production';

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: ms(expireStr as ms.StringValue), // milliseconds
      secure: isProd, // chỉ bật trên HTTPS
      sameSite: 'none' // cross-site set 'none'
    });
    const roleName = await this.roleService.findNameById(roleId);
    if (!roleName) throw new NotFoundException('Role không tồn tại');
    return {
      accessToken: this.jwtService.sign(payload),
      username,
      roleName,
      isPremium
    };
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);

    if (user) {
      const isValidPassword = await comparePassword(pass, user.password);
      if (isValidPassword)
        return {
          userId: user._id.toString(),
          username: user.username,
          isPremium: user.isPremium,
          roleId: user.roleId.toString()
        } as IUserRequest;
    }
    return null;
  }

  private async generateRefreshTokenResponse(payload) {
    const expiresIn = env.JWT_REFRESH_TOKEN_EXPIRE || AppConfig.JWT.JWT_REFRESH_TOKEN_EXPIRE;
    const refresh_token = this.jwtService.sign(payload, {
      secret: env.JWT_REFRESH_TOKEN_SECRET || AppConfig.JWT.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: ms(expiresIn as ms.StringValue) / 1000
    });
    await this.authRepo.create({
      userId: payload.sub,
      token: hashToken(refresh_token),
      jti: payload.jti
    });

    return refresh_token;
  }

  async logout(token: string) {
    return await this.authRepo.deleteByToken(token);
  }

  async refreshToken(token: string) {
    try {
      if (!token) throw new UnauthorizedException('Vui lòng đăng nhập');
      //Verify chữ ký & lấy payload
      const payload = this.jwtService.verify(token, { secret: env.JWT_REFRESH_TOKEN_SECRET });

      // Kiểm tra token có tồn tại trong db không
      const tokenInDb = await this.authRepo.findToken(payload.sub, payload.jti);

      if (!tokenInDb) throw new UnauthorizedException('Token đã bị thu hồi');

      // Kiểm tra user có tồn tại không
      const user = await this.userService.findById(payload.sub);
      if (!user) throw new NotFoundException('User không tồn tại');

      // Tạo accessToken mới
      const payloadAccessToken = {
        sub: user._id.toString(),
        username: user.username,
        roleId: user.roleId,
        jti: uuidv4()
      };
      const accessToken = this.jwtService.sign(payloadAccessToken);

      return { accessToken };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      }
      throw err;
    }
  }

  // Gửi email lấy lại mk
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const otp = generateOtp();
    const otpData: OtpDto = { ...forgotPasswordDto, otp };
    await this.authRepo.saveOtp(otpData);
    await this.emailProducer.sendEmail(forgotPasswordDto.email, otp);
  }

  // Xác nhận otp, nếu đúng sinh ra token
  async confirmOtp(otpDto: OtpDto) {
    const otpData = await this.authRepo.findOtp(otpDto);
    if (!otpData) throw new BadRequestException('Mã otp không hợp lệ hoặc đã hết hạn');

    //Xóa otp sau khi dùng
    await this.authRepo.deleteOtp(otpDto);

    const resetToken = this.jwtService.sign(
      { email: otpDto.email },
      { expiresIn: '5m', secret: env.JWT_RESET_PASSWORD_SECRET }
    );

    return { resetToken };
  }

  // Đổi mật khẩu
  async resetPassword(token: string, newPassword: string) {
    if (!token) throw new UnauthorizedException('Token missing');

    try {
      // 1. Giải mã token để lấy email
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_RESET_PASSWORD_SECRET
      });

      const email = payload.email;
      if (!email) throw new BadRequestException('Token không hợp lệ');

      // 2. Tìm user
      const user = await this.userService.findByEmail(email);
      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      // 3. Kiểm tra newPassword
      if (newPassword.length < 6) throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');

      // 4. Hash và cập nhật
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      return await this.userService.updateUserLocal(user._id.toString(), { password: user.password });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      }
      throw err;
    }
  }

  async changePassword(user: Partial<IUserRequest>, passwordDto: PasswordDto) {
    const oldPassword = await this.userService.findPasswordById(user.userId);
    if (!oldPassword) throw new NotFoundException('Người dùng không tồn tại');

    // Kiểm tra mật khẩu hiện tại
    const isValidPassword = await comparePassword(passwordDto.oldPassword, oldPassword);
    if (!isValidPassword) throw new BadRequestException('Mật khẩu hiện tại không khớp');

    // Kiểm tra new/confirm
    if (passwordDto.newPassword !== passwordDto.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp');

    // Hash và cập nhật
    const newHashed = await hashPassword(passwordDto.newPassword);
    await this.userService.updateUserLocal(user.userId, { password: newHashed });
  }

  async getProfile(user: Partial<IUserRequest>) {
    return await this.userService.findById(user.userId);
  }

  async updateInfo(userId: string, infoDto: InfoUserDto) {
    return await this.userService.updateInfo(userId, infoDto);
  }
}
