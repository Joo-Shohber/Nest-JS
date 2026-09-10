import { Review } from './../reviews/reviews.entity';
import { Product } from './../products/products.entity';
import { CURRENT_TIMESTAMP } from '../utils/constants';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { UserType } from '../utils/enums';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, default: null })
  password: string | null;

  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  googleId: string | null;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType: UserType;

  @Column({ default: false })
  isAccountVerified: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  resetPasswordToken: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true, default: null })
  profileImage: string | null;

  @OneToMany(() => Product, (product) => product.user)
  product: Product[];

  @OneToMany(() => Review, (review) => review.user)
  review: Review[];
}
