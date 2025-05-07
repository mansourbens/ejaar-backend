import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {UsersService} from "./users/users.service";
import {Role} from "./users/entities/role.entity";
import {RolesService} from "./users/roles.service";
import {CreateUserDto} from "./users/dto/create-user.dto";
import {UserRole} from "./users/enums/user-role.enum";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies & auth headers
  });
  app.setGlobalPrefix('api');
  const usersService = app.get(UsersService);  // Inject your service to access DB
  const rolesService = app.get(RolesService);  // Inject role repo for admin role

  // Check if the super admin role exists, create it if not
  let superAdminRole = await rolesService.findByName(UserRole.SUPER_ADMIN);
  if (!superAdminRole) {
    superAdminRole = new Role();
    superAdminRole.name = UserRole.SUPER_ADMIN;
    await rolesService.save(superAdminRole);
  }

  // Check if the super admin user exists
  const existingAdmin = await usersService.findByEmail('admin@ejaar.ma');
  if (!existingAdmin) {
    const superAdmin : CreateUserDto = {
      email: 'admin@ejaar.ma',
      password: 'ADMINejaarPASSWORD',
      role: superAdminRole,
      createdAt: new Date()
    };

    const user = await usersService.create(superAdmin);
    console.log(`Super Admin created: ${user.email}`);
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
