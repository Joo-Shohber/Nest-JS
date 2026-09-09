import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class FilesUploadDto {
  @ApiProperty({
    type: 'array',
    name: 'images',
    required: true,
    items: { type: 'string', format: 'binary' },
  })
  files: Express.Multer.File[];
}
