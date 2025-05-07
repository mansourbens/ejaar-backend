// src/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    UnauthorizedException,
    UseInterceptors,
    HttpException,
    HttpStatus, UseGuards, Get, Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {SetPasswordDto} from "./interfaces/set-password-dto";
import {ConnectionTrackerInterceptor} from "./interceptors/connection-tracker.interceptor";
import {CreateUserDto, UserType} from "../users/dto/create-user.dto";
import {UserRole} from "../users/enums/user-role.enum";
import {UsersService} from "../users/users.service";
import {RolesService} from "../users/roles.service";
import {AuthGuard} from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
                private usersService: UsersService,
                private rolesService: RolesService) {}

    @Post('login')
    @UseInterceptors(ConnectionTrackerInterceptor)
    async login(@Body() loginDto: { email: string; password: string }) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);  // Issue JWT on successful login
    }

    @UseGuards(AuthGuard('jwt')) // Use JWT guard
    @Get('me')
    async getCurrentUser(@Req() req: Request) {
        return { user: (req as any).user };
    }

    @Post('set-password')
    async setPassword(@Body() setPasswordDto: SetPasswordDto) {
        return this.authService.setPassword(setPasswordDto);
    }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        try {
            // Check if user already exists
            const existingUser = await this.usersService.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new HttpException('Un utilisateur avec cet email existe déjà', HttpStatus.BAD_REQUEST);
            }
            let role;
            if (createUserDto.userType === UserType.CLIENT) {
                role = await this.rolesService.findByName(UserRole.CLIENT)
            } else {
                role = await this.rolesService.findByName(UserRole.SUPPLIER_SUPER_ADMIN)
            }
            createUserDto.role = role;
            // Create user
            const user = await this.usersService.create({
                ...createUserDto,
            });

            // Return user without password
            const { password, ...result } = user;
            return result;
        } catch (error) {
            throw new HttpException(
                error.message || "Une erreur est survenue lors de la création de l'utilisateur",
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
