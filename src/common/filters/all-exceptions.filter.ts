import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { MulterError } from 'multer';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isMulterError = (e: unknown): e is MulterError =>
      e instanceof MulterError;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : isMulterError(exception)
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown = 'Internal server error';
    if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else if (isMulterError(exception)) {
      message = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: String(httpAdapter.getRequestUrl(request)),
      message,
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
