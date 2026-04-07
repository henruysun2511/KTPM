import { Body, Controller, Get, HttpCode, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import ms from 'ms';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest, RequestWithUserGoogle, RequestWithUserLocal } from 'shared/interfaces';
import { AppConfig } from 'common/constants';
import { env } from 'configs';
import { InfoUserDto } from 'modules/user/dtos';

import { AuthService } from '../services/auth.service';
import { GoogleOAuthGuard, LocalAuthGuard } from '../guards';
import { ForgotPasswordDto, OtpDto, PasswordDto, RegisterUserDto } from '../dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: Request) {
    // This endpoint initiates Google OAuth flow
    // The actual redirect is handled by GoogleAuthGuard
  }

  @Public()
  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req: RequestWithUserGoogle, @Res() res: Response) {
    try {
      const user = req.user;

      if (!user) {
        res.redirect(`${AppConfig.DOMAIN.BE}/api/v1/auth/error`);
        return;
      }
      const expireStr = env.JWT_REFRESH_TOKEN_EXPIRE || AppConfig.JWT.JWT_REFRESH_TOKEN_EXPIRE;

      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: ms(expireStr as ms.StringValue) // ms() sẽ trả ra số milliseconds,
      });

      res.cookie('accessToken', user.accessToken, {
        httpOnly: false, // Must be false so frontend JS can read it for now
        sameSite: 'none',
        secure: true,
        maxAge: ms('15m')
      });
      res.redirect(`${AppConfig.DOMAIN.FE}/callback`);
    } catch {
      res.redirect(`${AppConfig.DOMAIN.BE}/api/v1/auth/error`);
    }
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @ResponseMessage('Đăng nhập thành công')
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: RequestWithUserLocal, @Res({ passthrough: true }) response: Response) {
    return await this.authService.login(req.user, response);
  }

  @ResponseMessage('Đăng xuất thành công')
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken', { httpOnly: true });
  }

  @ResponseMessage('Lấy lại accessToken thành công')
  @Post('refreshToken')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    return await this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('verify-otp')
  async confirmOtp(@Body() otpDto: OtpDto, @Res({ passthrough: true }) res: Response) {
    const resetToken = await this.authService.confirmOtp(otpDto);
    res.clearCookie('resetToken', { httpOnly: true });
    res.cookie('resetToken', resetToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000 // 3 phút
    });
  }

  @Public()
  @Patch('reset-password')
  @ResponseMessage('Đổi mật khẩu thành công')
  async resetPassword(@Body('newPassword') newPassword: string, @Req() req: Request, @Res() res: Response) {
    const resetToken: { resetToken: string } = req.cookies?.resetToken;
    await this.authService.resetPassword(resetToken?.resetToken, newPassword);
    res.clearCookie('resetToken', { httpOnly: true });
  }

  @Patch('change-password')
  @ResponseMessage('Đổi mật khẩu thành công')
  async changePassword(@Body() passworđto: PasswordDto, @User() user: IUserRequest) {
    return await this.authService.changePassword({ userId: user.userId }, passworđto);
  }

  @ResponseMessage('Lấy ra thông tin thành công')
  @Get('profile')
  async getProfile(@User() user: IUserRequest) {
    return await this.authService.getProfile({ userId: user.userId });
  }

  @Put('info')
  @ResponseMessage('Cập nhật thông tin thành công')
  async updateInfo(@Body() infoDto: InfoUserDto, @User() user: IUserRequest) {
    return await this.authService.updateInfo(user.userId, infoDto);
  }
}
