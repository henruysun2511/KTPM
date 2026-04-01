import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'modules/redis/redis.module';
import { RoleModule } from 'modules/role/role.module';
import { EmailProducer } from 'modules/queue/producers';

import { UserModule } from '../user/user.module';
import { QueueModule } from '../queue/queue.module';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthRepository } from './repositories/auth.repository';
import { Token, TokenSchema } from './schemas/token.schema';
import { AuthLegacyController } from './controllers/auth-legacy.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { OtpAuth, OtpAuthSchema } from './schemas/otp.schema';

@Module({
  imports: [
    UserModule,
    PassportModule,
    RoleModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: OtpAuth.name, schema: OtpAuthSchema }
    ]),
    QueueModule
  ],
  controllers: [AuthController, AuthLegacyController],
  providers: [AuthService, GoogleStrategy, JwtStrategy, LocalStrategy, AuthRepository],
  exports: [AuthService]
})
export class AuthModule {}
