/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestjs/common';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  constructor(private readonly winstonLogger: WinstonLogger) {}

  log(message: any, context?: string) {
    this.winstonLogger.info(message, { context });
  }

  error(message: string, error?: Error, context?: string, meta?: Record<string, any>) {
    this.winstonLogger.error(message, {
      context,
      stack: error?.stack,
      ...meta
    });
  }

  warn(message: any, context?: string) {
    this.winstonLogger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.winstonLogger.debug(message, {
      context
    });
  }

  verbose(message: any, context?: string, payload?: string) {
    this.winstonLogger.verbose(message, { context, payload });
  }
}
