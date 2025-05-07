import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {UsersModule} from "../users/users.module";
import {UsersService} from "../users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Role} from "../users/entities/role.entity";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MailService} from "../mail/mail.service";
import {JwtStrategy} from "./auth.strategy";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConnectionTrackerInterceptor} from "./interceptors/connection-tracker.interceptor";
import {RolesService} from "../users/roles.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
    UsersModule,
    TypeOrmModule.forFeature([User, Role])
  ],
  providers: [AuthService, UsersService, MailService, RolesService, JwtStrategy,   {
    provide: APP_INTERCEPTOR,
    useClass: ConnectionTrackerInterceptor,
  },],
  controllers: [AuthController]
})
export class AuthModule {}
