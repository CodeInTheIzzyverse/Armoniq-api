import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | unknown[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string | unknown[]) || exception.message;
        error = (responseObj.error as string) || exception.name;
      }
    }

    const timestamp = new Date().toISOString();
    const path = request.url;

    const errorResponse = {
      statusCode: status,
      timestamp,
      path,
      error: typeof message === 'string' ? error : undefined,
      message: typeof message === 'string' ? message : undefined,
      errors: Array.isArray(message) ? message : undefined,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${path} ${status}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(`${request.method} ${path} ${status}`);
    }

    response.status(status).json(errorResponse);
  }
}
