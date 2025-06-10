import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ChatService} from './chat.service';
import {SendMessageDto} from "./dto/send-message.dto";

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // User endpoints
  @Post('user/message')
  async sendUserMessage(@Body() data: SendMessageDto) {
    return this.chatService.sendMessage(data, 'user');
  }

  @Get('user/messages/:userId')
  async getUserMessages(@Param('userId') userId: string) {
    if (!userId) return;
    return this.chatService.getUserMessages(+userId);
  }

  @Post('admin/users/message')
  async sendAdminMessage(@Body() data: SendMessageDto) {
    return this.chatService.sendMessage(data, 'admin');
  }
  @Get('admin/messages')
  async getAllMessages() {
    return this.chatService.getAll();
  }

  @Get('users')
  async getChatUsers() {
    return this.chatService.getChatUsers()
  }
}
