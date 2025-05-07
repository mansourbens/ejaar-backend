import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto, UserType} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RolesService} from "./roles.service";
import {UserRole} from "./enums/user-role.enum";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
      private readonly usersService: UsersService,
      private readonly rolesService: RolesService) {}

  @Post('/bank')
  async createBannkUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà.');
    }
    await this.usersService.createBankUser(createUserDto);


    return {
      message: 'Utilisateur créé avec succès. Un email a été envoyé avec ses identifiants.',
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà.');
    }
    await this.usersService.create(createUserDto);


    return {
      message: 'Utilisateur créé avec succès. Un email a été envoyé avec ses identifiants.',
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }


  @Get('/by-supplier/:supplierId')
  async findBySupplier(
      @Param('supplierId', ParseIntPipe) supplierId: number
  ) {
    return this.usersService.findBySupplier(supplierId);
  }
}
