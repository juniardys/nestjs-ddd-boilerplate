import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { AbstractRequestContext } from '@/common/contexts/abstract-request.context';
import { SettingService } from '@/shared/services/setting.service';

@Injectable()
export class ContextRequestInterceptor implements NestInterceptor {
  constructor(private readonly configService: SettingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ctx: AbstractRequestContext = RequestContext.get();
    ctx.headers = request.headers;
    ctx.params = request.query;
    ctx.timezone =
      request.headers[this.configService.headerKey.timezone] ??
      this.configService.app.timezone;
    ctx.lang = request.headers[this.configService.headerKey.lang];
    return next.handle();
  }
}
