import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const statusCode: number = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		let message: string | unknown[];
		let error: string;

		if (typeof exceptionResponse === 'string') {
			message = exceptionResponse;
			error = exception.name;
		} else if (typeof exceptionResponse === 'object') {
			const responseObj = exceptionResponse as Record<string, unknown>;
			message =
				(responseObj.message as string | unknown[]) ||
				exception.message;
			error = (responseObj.error as string) || exception.name;
		} else {
			message = exception.message;
			error = exception.name;
		}

		const timestamp = new Date().toISOString();
		const path = request.url;

		const errorResponse = {
			statusCode,
			timestamp,
			path,
			error: typeof message === 'string' ? error : undefined,
			message: typeof message === 'string' ? message : undefined,
			errors: Array.isArray(message) ? message : undefined,
		};

		if (statusCode >= 500) {
			this.logger.error(
				`${request.method} ${path} ${statusCode}`,
				exception.stack || '',
			);
		} else {
			this.logger.warn(`${request.method} ${path} ${statusCode}`);
		}

		response.status(statusCode).json(errorResponse);
	}
}
