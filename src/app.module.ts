import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import {UsersModule} from "./users/users.module";
import {SuppliersModule} from "./suppliers/suppliers.module";
import {QuotationsModule} from "./quotations/quotations.module";
import { MailService } from './mail/mail.service';
import {MailerModule} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from 'path';
import {ServeStaticModule} from "@nestjs/serve-static";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConnectionTrackerInterceptor} from "./auth/interceptors/connection-tracker.interceptor";
import { UploadFileModule } from './upload-file/upload-file.module';
import { CalculationRatesModule } from './calculation-rates/calculation-rates.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'assets'),  // Path to the assets directory
      serveRoot: '/assets',  // The route prefix for static files (e.g., /assets/fonts)
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'mansourbens@gmail.com',
          pass: 'rvuy vicd itfz zcxb',
        },
      },
      defaults: {
        from: '"EJAAR" <no-reply@ejaar.ma>',
      },
      template: {
        dir: join(process.cwd(), 'src', 'templates'),
        adapter: new HandlebarsAdapter(), // or EJS if you prefer
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity.{ts,js}'], // or explicitly list entities
      synchronize: true, // ⚠️ use false in prod and manage migrations
    }),
    AuthModule,
    UsersModule,
    SuppliersModule,
    QuotationsModule,
    UploadFileModule,
    CalculationRatesModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService

  ],
})
export class AppModule {}
