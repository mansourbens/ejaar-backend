export interface SendMessageDto {
    message: string;
    type: 'user' | 'admin';
    timestamp: Date;
    email: string;
    senderId: number;
}
