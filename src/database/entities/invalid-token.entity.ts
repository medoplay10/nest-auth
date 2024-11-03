import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class InvalidToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.invalidTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;


}
