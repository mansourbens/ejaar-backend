import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Supplier} from "./entities/supplier.entity";
import {MailService} from "../mail/mail.service";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Role} from "../users/entities/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, User, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),],
  controllers: [SuppliersController],
  providers: [SuppliersService, MailService],
})
export class SuppliersModule {}
