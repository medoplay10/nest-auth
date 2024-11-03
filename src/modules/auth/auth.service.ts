import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { CreateUserRequest } from './dto/request/create-user.request';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthLoginRequest } from './dto/request/auth-login.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/database/entities/user.entity';
import { InvalidToken } from 'src/database/entities/invalid-token.entity';
@Injectable()
export class AuthService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,

    @InjectRepository(InvalidToken)
    private invalidTokensRepository: Repository<InvalidToken>,

    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  async createUser(createUserRequest: CreateUserRequest) {
    const { password, role, userName } = createUserRequest;
    const userFind = await this.usersRepository.findOne({
      where: {
        userName,
      },
    });

    if (userFind) {
      throw new Error('User already exists');
    }

    const hashPassword = await argon2.hash(password);
    const userCreate = this.usersRepository.create({
      password: hashPassword,
      userName,
      role,
    });

    const user = await this.usersRepository.save(userCreate);

    const { accessToken, refreshToken } = await this.generateAuthTokens(user);
    const userData = {
      id: user.id,
      userName: user.userName,
      role: user.role,
      accessToken,
      refreshToken,
    };

    return userData;
  }

  async loginUser(authLoginRequest: AuthLoginRequest) {
    const { password, role, userName } = authLoginRequest;
    const user = await this.usersRepository.findOne({
      where: {
        userName,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const checkPassword = await argon2.verify(user.password, password);
    if (!checkPassword) {
      throw new Error('Wrong password');
    }
    const { accessToken, refreshToken } = await this.generateAuthTokens(user);

    const userData = {
      id: user.id,
      userName: user.userName,
      role: user.role,
      accessToken,
      refreshToken,
    };

    return userData;
  }

  async logout() {
    const user_id = this.request.user['user_id'];
    const accessToken = this.request.accessToken;
    const invalidToken = this.invalidTokensRepository.create({
      token: accessToken,
      user_id,
    });
    await this.invalidTokensRepository.save(invalidToken);

    await this.refreshTokensRepository.delete({
      user_id,
    });
  }

  async refreshToken() {
    const user_id = this.request.user['user_id'];
    const refreshToken = this.request.user['refreshToken'];

    const refreshTokenFind = await this.refreshTokensRepository.findOne({
      where: {
        token: refreshToken,
        user_id,
      },
      relations: {
        user: true,
      },
    });

    if (!refreshTokenFind) {
      throw new Error('Refresh token not found');
    }
    await this.refreshTokensRepository.delete({ user_id });
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateAuthTokens(refreshTokenFind.user);
    await this.refreshTokensRepository.save({
      token: newRefreshToken,
      user_id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async generateAuthTokens(user: User) {
    const accessToken = await this.jwtService.signAsync(
      {
        user_id: user.id,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        user_id: user.id,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    const refreshTokenCreate = this.refreshTokensRepository.create({
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await this.refreshTokensRepository.save(refreshTokenCreate);

    return {
      accessToken,
      refreshToken,
    };
  }
}
