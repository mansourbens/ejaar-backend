import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import {JwtPayload} from "./interfaces/jwt-payload.interface";
import {ConfigService} from "@nestjs/config"; // adjust path if necessary

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }
    async validate(payload: JwtPayload) {
        return this.usersService.findById(payload.sub);  // Find the user by their ID
    }
}
