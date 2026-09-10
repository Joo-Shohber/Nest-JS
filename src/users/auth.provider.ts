import { MailService } from './../mail/mail.service';
import { LoginDto } from './dtos/login.dto';
import { User } from './users.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../utils/types';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ResetUserPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  // Authentication

  public async register(dto: RegisterDto) {
    const userExist = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (userExist) {
      throw new BadRequestException('User Already Exist');
    }

    const hashPassword = await this.hashPassword(dto.password);

    let newUser = this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashPassword,
      verificationToken: randomBytes(32).toString('hex'),
    });

    newUser = await this.userRepository.save(newUser);

    const link = this.generateVerifyLink(
      newUser.id,
      newUser.verificationToken!,
    );

    await this.mailService.sendVerificationToken(newUser.email, link);

    return {
      message:
        'Verification Token Has Been Sent To Your Email, Please Verify Your Account',
    };
  }

  public async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid Email or Password');
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid Email or Password');
    }

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;

      if (!verificationToken) {
        verificationToken = randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;

        await this.userRepository.save(user);
      }

      const link = this.generateVerifyLink(user.id, verificationToken);

      await this.mailService.sendVerificationToken(user.email, link);

      return {
        message:
          'Verification Token Has Been Sent To Your Email, Please Verify Your Account',
      };
    }

    const accessToken = await this.generateJwt({
      id: user.id,
      userType: user.userType,
    });

    return { accessToken };
  }

  // Email Verification

  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (!verificationToken) {
      throw new BadRequestException('No Verification Token Provided');
    }

    if (user.verificationToken !== verificationToken) {
      throw new BadRequestException('Invalid Verification Token');
    }

    user.isAccountVerified = true;
    user.verificationToken = null;

    await this.userRepository.save(user);

    return {
      message: 'Email Verified Successfully',
    };
  }

  // Password Reset

  public async sendResetPasswordLink(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      user.resetPasswordToken = randomBytes(32).toString('hex');

      await this.userRepository.save(user);

      const link = this.generateResetPasswordLink(
        user.id,
        user.resetPasswordToken,
      );

      await this.mailService.sendResetPassword(email, link);
    }

    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (!resetPasswordToken) {
      throw new BadRequestException('No Reset Token Provided');
    }

    if (user.resetPasswordToken !== resetPasswordToken) {
      throw new BadRequestException('Invalid Reset Token');
    }

    return {
      message: 'Valid Reset Password Link',
    };
  }

  public async resetPassword(dto: ResetUserPasswordDto) {
    const { userId, resetPasswordToken, newPassword } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (!resetPasswordToken) {
      throw new BadRequestException('No Reset Token Provided');
    }

    if (user.resetPasswordToken !== resetPasswordToken) {
      throw new BadRequestException('Invalid Reset Token');
    }

    user.password = await this.hashPassword(newPassword);
    user.resetPasswordToken = null;

    await this.userRepository.save(user);

    return {
      message: 'Password Reset Successfully, Please Login',
    };
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Google

  public async validateGoogleUser(data: {
    googleId: string;
    email: string;
    username: string;
  }) {
    let user = await this.userRepository.findOne({
      where: [{ googleId: data.googleId }, { email: data.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = data.googleId;
        user = await this.userRepository.save(user);
      }
      return user;
    }

    user = this.userRepository.create({
      googleId: data.googleId,
      email: data.email,
      username: data.username,
      isAccountVerified: true,
    });

    return this.userRepository.save(user);
  }

  public async loginWithGoogle(user: User) {
    const accessToken = await this.generateJwt({
      id: user.id,
      userType: user.userType,
    });

    return { accessToken };
  }

  // Helpers

  private async generateJwt(payload: JwtPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private generateVerifyLink(userId: number, verificationToken: string) {
    return `${this.config.get<string>(
      'DOMAIN',
    )}/api/users/verify-email/${userId}/${verificationToken}`;
  }

  private generateResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    return `${this.config.get<string>(
      'DOMAIN',
    )}/api/users/reset-password/${userId}/${resetPasswordToken}`;
  }
}
