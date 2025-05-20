import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {RolesService} from "./roles.service";
import {Role} from "./entities/role.entity";
import {MailService} from "../mail/mail.service";
import {AuthModule} from "../auth/auth.module";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Supplier} from "../suppliers/entities/supplier.entity";
import {Client} from "../client/entities/client.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Client]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),],
  controllers: [UsersController],
  providers: [UsersService, RolesService, MailService],
})
export class UsersModule {}
