import { ApiProperty } from '@nestjs/swagger';
import type { Express } from 'express';

export class ImageUploadedDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    name: 'profile-image',
  })
  file: Express.Multer.File;
}
