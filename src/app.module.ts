import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { dataSourceOptions } from '../db/data-source';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';

@Module({
  controllers: [AppController],
  imports: [
    UsersModule,
    ProductsModule,
    ReviewsModule,
    UploadsModule,
    MailModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),
  ],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .exclude({ path: '/api/auth', method: RequestMethod.ALL })
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
