import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, type ClassConstructor } from 'class-transformer';

@Injectable()
export class SerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === 'object' && 'constructor' in data) {
          const constructor = data.constructor as ClassConstructor<unknown>;
          return plainToInstance(constructor, data, {
            excludeExtraneousValues: true,
          });
        }
        return data;
      }),
    );
  }
}
