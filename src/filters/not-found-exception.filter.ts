import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Request, Response } from '@/interfaces/fastify.interface';

import { LoggerService } from '../shared/services/logger.service';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly _logger: LoggerService) {}

  catch(_exception: HttpException, host: ArgumentsHost) {
    const i18n = I18nContext.current(host);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const message = i18n.t('error.NOT_FOUND');
    const code = HttpStatus.NOT_FOUND;

    if (request) {
      const errorResponse = {
        success: false,
        status: code,
        message,
        payload:
          typeof response === 'object' ? (response as any).payload : null,
      };

      return response.status(code).send(errorResponse);
    } else {
      return _exception;
    }
  }
}
