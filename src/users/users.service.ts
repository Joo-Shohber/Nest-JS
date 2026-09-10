import { AuthProvider } from './auth.provider';
import { LoginDto } from './dtos/login.dto';
import { User } from './users.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayloadType } from '../utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from '../utils/enums';
import { RegisterDto } from './dtos/register.dto';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { ResetUserPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  // Authentication

  /**
   * Create New User
   * @param dto Data From Register
   * @returns Verification Message
   */
  public async register(dto: RegisterDto) {
    return this.authProvider.register(dto);
  }

  /**
   * Log In User
   * @param dto Data From Login
   * @returns JWT Access Token or Verification Message
   */
  public async login(dto: LoginDto) {
    return this.authProvider.login(dto);
  }

  // Email Verification

  /**
   * Verify User Email
   * @param userId User ID From Link
   * @param verificationToken Verification Token From Link
   * @returns Verification Message
   */
  public async verifyEmail(userId: number, verificationToken: string) {
    return this.authProvider.verifyEmail(userId, verificationToken);
  }

  // Password Reset

  /**
   * Send Reset Password Link
   * @param email User Email
   * @returns Reset Password Message
   */
  public async sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  /**
   * Validate Reset Password Link
   * @param userId User ID From Link
   * @param resetPasswordToken Reset Password Token From Link
   * @returns Validation Message
   */
  public async getResetPassword(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  /**
   * Reset User Password
   * @param dto Data From Reset Password
   * @returns Reset Password Message
   */
  public async resetPassword(dto: ResetUserPasswordDto) {
    return this.authProvider.resetPassword(dto);
  }

  /**
   * Login With Google
   * @param user User From Google Profile
   * @returns JWT Access Token
   */
  public async loginWithGoogle(user: User) {
    return this.authProvider.loginWithGoogle(user);
  }

  // User

  /**
   * Get Current User
   * @param id User ID
   * @returns User
   */
  public async getCurrentUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User With id ${id} Not Found`);
    }

    return user;
  }

  /**
   * Get All Users
   * @returns All Users
   */
  public async getAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Update User
   * @param id User ID From Payload
   * @param dto Data From Update User
   * @returns Updated User
   */
  public async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getCurrentUser(id);

    user.username = dto.username ?? user.username;

    if (dto.password) {
      user.password = await this.authProvider.hashPassword(dto.password);
    }

    return this.userRepository.save(user);
  }

  /**
   * Delete User
   * @param userId User ID
   * @param payload Current User Payload
   * @returns Delete Message
   */
  public async deleteUser(userId: number, payload: JwtPayloadType) {
    const user = await this.getCurrentUser(userId);

    if (user.id !== payload.id && payload.userType !== UserType.ADMIN) {
      throw new UnauthorizedException('Access Denied, You Are Not Allowed');
    }

    if (user.profileImage) {
      await this.removeProfileImage(user.id);
    }

    await this.userRepository.remove(user);

    return {
      message: 'User Deleted Successfully',
    };
  }

  // Profile Image

  /**
   * Upload Profile Image
   * @param userId User ID From Payload
   * @param file Profile Image
   * @returns Updated User
   */
  public async uploadProfileImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.getCurrentUser(userId);

    if (user.profileImage) {
      await this.removeProfileImage(userId);
    }

    user.profileImage = file.filename;

    return this.userRepository.save(user);
  }

  /**
   * Remove Profile Image
   * @param userId User ID From Payload
   * @returns Updated User
   */
  public async removeProfileImage(userId: number): Promise<User> {
    const user = await this.getCurrentUser(userId);

    if (!user.profileImage) {
      throw new BadRequestException('No Profile Image Found');
    }

    const imagePath = join(
      process.cwd(),
      'images',
      'profile-images',
      user.profileImage,
    );

    unlinkSync(imagePath);

    user.profileImage = null;

    return this.userRepository.save(user);
  }
}
