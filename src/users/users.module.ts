import { StringValue } from 'ms';
import { BadRequestException, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from './auth.provider';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [UsersController],
  providers: [UserService, AuthProvider, GoogleStrategy],
  exports: [UserService],
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<StringValue>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './images/profile-images',
        filename: (req, file, cb) => {
          const prefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),

      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },

      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
    MailModule,
  ],
})
export class UsersModule {}
