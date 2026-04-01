import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GlobalExceptionFilter } from 'common/exceptions/global-exception.filter';
import { LoggerModule } from 'loggers/logger.module';
import { PermissionModule } from 'modules/permission/permission.module';
import { RoleModule } from 'modules/role/role.module';

@Global()
@Module({
  imports: [
    LoggerModule,
    PermissionModule,
    RoleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRE') || '100m'
        }
      })
    })
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ],
  exports: [LoggerModule, PermissionModule, RoleModule, JwtModule]
})
export class SharedModule {}
