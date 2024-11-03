import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const DatabaseConfigModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule], 
  inject: [ConfigService], 
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', '111111'),
    database: configService.get<string>('DATABASE_NAME', 'nest-auth'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true), // optional: set to true only for development
  }),
});
