import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {UsersService} from "./users/users.service";
import {Role} from "./users/entities/role.entity";
import {RolesService} from "./users/roles.service";
import {CreateUserDto} from "./users/dto/create-user.dto";
import {UserRole} from "./users/enums/user-role.enum";
import {CalculationRate} from "./calculation-rates/entities/calculation-rate.entity";
import {CalculationRatesService} from "./calculation-rates/calculation-rates.service";
import {ResidualConfigService} from "./residual-config/residual-config.service";
import {RateConfigService} from "./rate-config/rate-config.service";
import {CommercialMarginService} from "./commercial-margin/commercial-margin.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:3000',
    'https://ejaar.ma',
    'https://www.ejaar.ma'
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies & auth headers
  });
  app.setGlobalPrefix('api');
  const usersService = app.get(UsersService);  // Inject your service to access DB
  const rolesService = app.get(RolesService);  // Inject role repo for admin role
  const calculationRatesService = app.get(CalculationRatesService);  // Inject role repo for admin role
  const residualConfigService = app.get(ResidualConfigService);  // Inject role repo for admin role
  const rateConfigService = app.get(RateConfigService);  // Inject role repo for admin role
  const commercialMarginService = app.get(CommercialMarginService);  // Inject role repo for admin role

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
  let calculationRate = await calculationRatesService.findOne(1);
  if (!calculationRate) {
    calculationRate = {
      residualValuePercentage: 5,
      fileFeesPercentage: 3,
      financingSpreadAnnual: 3,
      leaserFinancingRateAnnual: 7.5,
      id: 1
    }
    const t = await calculationRatesService.create(calculationRate);
    console.log(`Calculation rates created`);
  }
  await residualConfigService.seedInitialData();
  await rateConfigService.seedInitialData();
  await commercialMarginService.seedInitialData();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
