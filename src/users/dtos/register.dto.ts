import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MaxLength(250)
  @IsNotEmpty({ message: 'Email Is Required' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password Is Required' })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(2, 150)
  @IsOptional()
  username?: string;
}
