import { Module } from '@nestjs/common';
import { ResidualConfigService } from './residual-config.service';
import { ResidualConfigController } from './residual-config.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Role} from "../users/entities/role.entity";
import {ResidualConfig} from "./entities/residual-config.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ResidualConfig])],
    controllers: [ResidualConfigController],
  providers: [ResidualConfigService],
})
export class ResidualConfigModule {}
