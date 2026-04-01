/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { AppConfig } from 'common/constants/app-config.constant';
import { env } from 'configs/env.config';
import { createLogger, transports, format } from 'winston';

export class WinstonConfig {
  constructor() {}

  createLogger() {
    // safer printf that accepts the whole info object and provides fallbacks
    const customFormat = format.printf((info) => {
      const timestamp = info.timestamp ?? new Date().toISOString();
      const level = info.level ?? 'info';
      const message = info.stack ?? info.message ?? '';
      const context = info.context ? `- CONTEXT: ${info.context}` : '';
      return '\u001b[36m[NEST]\u001b[0m' + ' - ' + ` ${timestamp} - [${level}] - ${message} ${context}`.trim();
    });

    // transform to uppercase the plain level BEFORE colorize so colors are preserved
    const uppercaseLevel = format((info) => {
      if (info.level) {
        info.level = info.level.toString().toUpperCase();
      }
      return info;
    })();

    // format used for Logtail (no colors)
    const logtailFormat = format.combine(uppercaseLevel, format.errors({ stack: true }));

    const level = env.NODE_ENV === 'production' ? 'info' : 'silly';
    // Logtail token
    const logtail = new Logtail(env.LOGTAIL_TOKEN, {
      endpoint: env.LOGTAIL_ENDPOINT
    });

    // format used for file (include timestamp, no colorize)
    const fileFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      uppercaseLevel,
      format.errors({ stack: true }),
      customFormat
    );

    // build transports + handlers dynamically so Logtail only active in production
    const transportsList: any[] = [
      new transports.Console({
        level: AppConfig.LOGGER.CONSOLE_LEVEL,
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          uppercaseLevel,
          format.colorize({ all: true }),
          format.errors({ stack: true }),
          customFormat
        )
      })
    ];

    const exceptionHandlersList: any[] = [new transports.Console({ level: 'error' })];

    const rejectionHandlersList: any[] = [new transports.Console({ level: 'error' })];

    // only add Logtail transport/handlers in production and if token provided
    if (env.NODE_ENV === 'production' && env.LOGTAIL_TOKEN) {
      transportsList.push(
        new LogtailTransport(logtail, {
          level: AppConfig.LOGGER.LOGTAIL_LEVEL,
          format: logtailFormat
        }),
        new transports.File({
          filename: env.LOG_FILE_PATH ?? 'logs/app.log',
          level: 'info',
          format: fileFormat
        })
      );

      exceptionHandlersList.unshift(
        new LogtailTransport(logtail, { level: 'error' }),
        new transports.File({ filename: env.LOG_FILE_PATH ?? 'logs/app.log', level: 'error', format: fileFormat })
      );
      rejectionHandlersList.unshift(
        new LogtailTransport(logtail, { level: 'error' }),
        new transports.File({ filename: env.LOG_FILE_PATH ?? 'logs/app.log', level: 'error', format: fileFormat })
      );
    }

    const devLogger = {
      level: level,
      transports: transportsList,
      exceptionHandlers: exceptionHandlersList,
      rejectionHandlers: rejectionHandlersList
    };

    const instanceLogger = devLogger;

    return createLogger(instanceLogger);
  }
}
