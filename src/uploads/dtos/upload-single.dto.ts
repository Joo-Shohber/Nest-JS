import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'image',
    required: true,
  })
  files: Express.Multer.File[];
}
