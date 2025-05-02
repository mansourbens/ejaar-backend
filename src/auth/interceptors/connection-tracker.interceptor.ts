import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import {UsersService} from "../../users/users.service";
import {User} from "../../users/entities/user.entity";

@Injectable()
export class ConnectionTrackerInterceptor implements NestInterceptor {
    constructor(private readonly usersService: UsersService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as User; // From JWT strategy

        return next.handle().pipe(
            tap(() => {
                if (user) {
                    this.usersService.updateConnectionData(
                        user.id,
                        new Date()
                    );
                }
            })
        );
    }
}
