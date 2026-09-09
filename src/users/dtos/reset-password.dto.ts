import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
} from 'class-validator';

export class ResetUserPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Password Is Required' })
  @MinLength(6)
  @IsOptional()
  newPassword: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  userId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  resetPasswordToken: string;
}
