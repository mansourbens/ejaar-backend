import {Module} from '@nestjs/common';
import {QuotationsService} from './quotations.service';
import {QuotationsController} from './quotations.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Supplier} from "../suppliers/entities/supplier.entity";
import {User} from "../users/entities/user.entity";
import {Quotation} from "./entities/quotation.entity";
import {UsersService} from "../users/users.service";
import {SuppliersService} from "../suppliers/suppliers.service";
import {Role} from "../users/entities/role.entity";
import {MailService} from "../mail/mail.service";
import {JwtService} from "@nestjs/jwt";
import {RateConfigService} from "../rate-config/rate-config.service";
import {ResidualConfigService} from "../residual-config/residual-config.service";
import {RateConfig} from "../rate-config/entities/rate-config.entity";
import {ResidualConfig} from "../residual-config/entities/residual-config.entity";
import {Client} from "../client/entities/client.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, User, Supplier, Role, RateConfig, ResidualConfig, Client])],
  controllers: [QuotationsController],
  providers: [QuotationsService, UsersService, SuppliersService, MailService, JwtService,
    RateConfigService, ResidualConfigService],
})
export class QuotationsModule {}
