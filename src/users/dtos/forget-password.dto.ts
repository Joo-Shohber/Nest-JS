import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty()
  @IsString()
  @MaxLength(250)
  @IsNotEmpty({ message: 'Email Is Required' })
  email: string;
}
