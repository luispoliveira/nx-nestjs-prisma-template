import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { LogsService } from '@nx-nestjs-prisma-template/data-layer';
import { ContextUtil } from '@nx-nestjs-prisma-template/shared';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  private readonly blackListedMethods = ['login'];

  constructor(private readonly logsService: LogsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Promise<Observable<unknown>> {
    const request = ContextUtil.getRequest(context);

    const userAgent = request.get('user-agent') as string;
    const { ip, method, url, body, query, params, headers } = request;

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const username = request.user?.username || 'anonymous';

    const log = await this.logsService.create({
      data: {
        userAgent,
        headers,
        ip,
        method,
        url,
        body: this.blackListedMethods.includes(handlerName) ? undefined : body,
        query: query,
        params: params,
        username,
        className,
        methodName: handlerName,
      },
    });

    return next.handle().pipe(
      tap(async (res: unknown) => {
        await this.logsService.update({
          where: { id: log.id },
          data: {
            response: this.blackListedMethods.includes(handlerName)
              ? undefined
              : (res as string),
          },
        });
      }),
    );
  }
}
