import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const protocol = request.protocol;
    const host = request.get('host');
    const fullUrl = `${protocol}://${host}${request.originalUrl}`;
    const baseUrl = `${protocol}://${host}`; 

    return next.handle().pipe(
      map((payload) => {
        let data = payload;
        let manualLinks = {};

        if (payload && payload.links && payload.data) {
            manualLinks = payload.links;
            data = payload.data;
        } else if (payload && payload.links) {
            const { links, ...rest } = payload;
            manualLinks = links;
            data = rest;
        }

        return {
          data: data,
          _links: {
            self: {
              href: fullUrl,
              method: request.method,
            },
            ...manualLinks 
          },
        };
      }),
    );
  }
}