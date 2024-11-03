import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidToken } from 'src/database/entities/invalid-token.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @InjectRepository(InvalidToken)
    private invalidTokensRepository: Repository<InvalidToken>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = (await super.canActivate(context)) as boolean;

    if (!isAuthenticated) {
      throw new UnauthorizedException('User not authenticated');
    }
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization
      .replace('Bearer', '')
      .trim();
    const user_id = request.user['user_id'];

    const invalidToken = await this.invalidTokensRepository.findOne({
      where: {
        token: accessToken,
        user_id,
      },
    });

    if (invalidToken) {
      throw new UnauthorizedException('Access token is invalid');
    }

    request.accessToken = accessToken;

    return true;
  }
}
