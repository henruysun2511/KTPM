import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { env } from 'configs';

import { AuthService } from '../services/auth.service';

export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string; verified: boolean }>;
  provider: string;
  displayName: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: 'https://novawave-backend.onrender.com/api/v1/auth/google-redirect',
      scope: ['email', 'profile']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) {
    try {
      const user = await this.authService.validateGoogleUser({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
