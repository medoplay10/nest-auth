import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from 'src/common/enums/role.enum';

export class AuthLoginRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  userName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Roles)
  role: Roles;
}
