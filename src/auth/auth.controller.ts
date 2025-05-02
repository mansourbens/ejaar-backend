// src/auth/auth.controller.ts
import {Controller, Post, Body, UnauthorizedException, UseInterceptors} from '@nestjs/common';
import { AuthService } from './auth.service';
import {SetPasswordDto} from "./interfaces/set-password-dto";
import {ConnectionTrackerInterceptor} from "./interceptors/connection-tracker.interceptor";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @UseInterceptors(ConnectionTrackerInterceptor)

    async login(@Body() loginDto: { email: string; password: string }) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);  // Issue JWT on successful login
    }

    @Post('set-password')
    async setPassword(@Body() setPasswordDto: SetPasswordDto) {
        return this.authService.setPassword(setPasswordDto);
    }
}
