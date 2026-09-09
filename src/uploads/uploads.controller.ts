import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Express, Response } from 'express';
import { unlinkSync } from 'fs';
import { resolve } from 'path';
import { FilesUploadDto } from './dtos/upload-multi.dto';
import { FileUploadDto } from './dtos/upload-single.dto';

@Controller('api/uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto, description: 'Upload Single Images' })
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { message: 'File uploaded successfully', filename: file.filename };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FilesUploadDto, description: 'Upload Multiple Images' })
  public async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0)
      throw new BadRequestException('No files uploaded');
    return { message: 'File uploaded successfully', files };
  }

  @Get(':image')
  public async getImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: './images' });
  }

  @Delete(':image')
  public async deleteImage(@Param('image') image: string) {
    const imagePath = resolve('.', `images/${image}`);
    unlinkSync(imagePath);
    return { message: 'Image Deleted Successfully' };
  }
}
