import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRequest } from './dto/request/create-user.request';
import { AuthLoginRequest } from './dto/request/auth-login.request';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { RolesDecorator } from '../../common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';
import { Request } from 'express';

@ApiTags('Auth')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async createUser(@Body() createUserRequest: CreateUserRequest) {
    return await this.authService.createUser(createUserRequest);
  }

  @Post('login')
  async loginUser(@Body() authLoginRequest: AuthLoginRequest) {
    return await this.authService.loginUser(authLoginRequest);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RolesDecorator(Roles.USER)
  @Post('logout')
  async logout() {
    return await this.authService.logout();
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    return await this.authService.refreshToken();
  }
}
