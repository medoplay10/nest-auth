import { Module } from '@nestjs/common';
import { DatabaseConfigModule } from './config/database.config';
import { EnvironmentConfigModule } from './config/environment.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    EnvironmentConfigModule,
    DatabaseConfigModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
