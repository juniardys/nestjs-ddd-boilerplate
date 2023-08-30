import { RequestContext } from '@medibloc/nestjs-request-context';

export class AbstractRequestContext extends RequestContext {
  headers: any;
  params: any;
  timezone: string;
  lang?: string;
}
