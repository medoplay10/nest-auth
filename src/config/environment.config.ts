import { ConfigModule } from '@nestjs/config';

export const EnvironmentConfigModule  = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});
