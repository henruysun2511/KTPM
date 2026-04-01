import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'shared/decorators/customize';

import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthLegacyController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('error')
  authError(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc3545; }
            .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Authentication Error</h1>
          <div class="info">
            <p>Something went wrong during the Google OAuth process.</p>
            <p><a href="/api/v1/auth/google">Try Again</a></p>
          </div>
        </body>
      </html>
    `;
    res.status(200).contentType('text/html').send(html);
  }
}
