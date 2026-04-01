import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';

import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }
  async validate(username: string, password: string): Promise<IUserRequest> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    return user;
  }
}
