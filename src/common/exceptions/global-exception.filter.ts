import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from 'shared/interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;
    let messageKey: string;
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        messageKey = exceptionResponse || this.getMessageKeyFromStatus(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        messageKey =
          (responseObj.message as string) || (responseObj.response as string) || this.getMessageKeyFromStatus(status);
        details = responseObj.details || null;
      } else {
        messageKey = this.getMessageKeyFromStatus(status);
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messageKey = 'Internal server error';

      details = process.env.NODE_ENV === 'development' ? exception.message : null;

      this.logger.error('Unhandled error:', exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messageKey = 'Internal server error';

      this.logger.error('Unknown exception:', exception);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorResponse: ApiResponse<any> = {
      success: false,
      message: messageKey,
      data: details
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${messageKey}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(status).json(errorResponse);
  }

  private getMessageKeyFromStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.CONFLICT:
        return 'Conflict occurred';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Validation error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service unavailable';
      default:
        return 'Internal server error';
    }
  }
}
