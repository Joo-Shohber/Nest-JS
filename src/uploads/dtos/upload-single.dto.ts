import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'image',
    required: true,
  })
  file: Express.Multer.File;
}
