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
export class LoggerInterceptor implements NestInterceptor {
  private readonly blackListedMethods = [
    'login',
    'register',
    'verifyLogin',
    'whoAmI',
    'recoverPassword',
    'activateAccount',
  ];
  //private logger = new Logger(LoggerInterceptor.name);

  constructor(private readonly loggerService: LogsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<never>,
  ): Promise<Observable<never>> {
    const request = ContextUtil.getRequest(context);

    const userAgent: string = request.get('user-agent') || '';
    const { ip, method, url, body, query, params } = request;

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const username = request.user?.username || 'anonymous';

    const log = await this.loggerService.create({
      data: {
        userAgent,
        ip,
        method,
        url,
        body: body,
        query,
        params,
        username,
        className,
        methodName: handlerName,
      },
    });

    return next.handle().pipe(
      tap(async (res) => {
        await this.loggerService.update({
          where: { id: log.id },
          data: {
            response: this.blackListedMethods.includes(handlerName)
              ? undefined
              : res,
          },
        });
      }),
    );
  }
}
