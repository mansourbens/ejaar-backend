import {IsBoolean, IsNotEmpty, IsOptional} from "class-validator";

export class CreateChatDto {
    @IsNotEmpty()
    message: string;

    @IsNotEmpty()
    senderId: number;

    @IsBoolean()
    @IsOptional()
    isSeen?: boolean;

    @IsNotEmpty()
    type: 'admin' | 'user';
}
