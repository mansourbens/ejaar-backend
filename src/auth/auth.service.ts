// src/auth/auth.service.ts
import {BadRequestException, Injectable} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import {SetPasswordDto} from "./interfaces/set-password-dto";
import {User} from "../users/entities/user.entity";  // Adjust the import path

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            return user;  // Return the user if credentials are valid
        }
        return null;  // Return null if user not found or invalid password
    }

    async login(user: User) {
        await this.usersService.updateConnectionData(
            user.id,
            new Date(),
        );

        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user
        };
    }

    async setPassword({ token, password }: SetPasswordDto) {
        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch (error) {
            throw new BadRequestException('Invalid or expired token');
        }

        const user = await this.usersService.findByEmail(payload.email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await this.usersService.save(user);

        return { message: 'Password set successfully!' };
    }
}
