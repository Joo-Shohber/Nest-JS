import { BadRequestException, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  controllers: [UploadsController],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './images',
        filename: (_req, file, cb) => {
          const prefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),

      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
})
export class UploadsModule {}
