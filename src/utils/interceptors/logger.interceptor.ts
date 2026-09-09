import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    console.log('Before Controller');

    return next.handle().pipe(
      map((response) => {
        const { password, ...otherData } = response;
        return { ...otherData };
      }),
    );
  }
}
