import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {User} from "../users/entities/user.entity";

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendSetPasswordEmail(user: User, token: string) {
        const url = `http://localhost:3000/set-password?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Créez votre mot de passe',
            template: 'set-password', // points to set-password.hbs
            context: {
                name: user.fullName,
                url,
            },
        });
    }
}
