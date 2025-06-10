import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateChatDto} from './dto/create-chat.dto';
import {UpdateChatDto} from './dto/update-chat.dto';
import {SendMessageDto} from "./dto/send-message.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Chat} from "./entities/chat.entity";
import {Repository} from "typeorm";
import {UploadFile} from "../upload-file/entities/upload-file.entity";
import {User} from "../users/entities/user.entity";

@Injectable()
export class ChatService {

    constructor(@InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
                @InjectRepository(User) private readonly userRepository: Repository<User>) {
    }

    create(createChatDto: CreateChatDto) {
        return 'This action adds a new chat';
    }

    findAll() {
        return `This action returns all chat`;
    }

    findOne(id: number) {
        return `This action returns a #${id} chat`;
    }

    update(id: number, updateChatDto: UpdateChatDto) {
        return `This action updates a #${id} chat`;
    }

    remove(id: number) {
        return `This action removes a #${id} chat`;
    }

    async sendMessage(sendMessageDto: SendMessageDto, type: 'user' | 'admin') {
        // 1. Find the sender user
        const sender = await this.userRepository.findOne({
            where: { id: sendMessageDto.senderId },
        });

        if (!sender) {
            throw new NotFoundException(`User with ID ${sendMessageDto.senderId} not found`);
        }

        // 2. Create the chat entity
        const chat = this.chatRepository.create({
            message: sendMessageDto.message,
            sender: sender,
            type
        });

        // 3. Save to database
        return await this.chatRepository.save(chat);
    }

    async getUserMessages(userId: number): Promise<Chat[]> {
        return this.chatRepository.find({
            where: { sender: { id: userId } },
            order: { createdAt: 'ASC' },
        });
    }

    async getChatUsers(): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.messages', 'chat')  // Join with chat messages
            .groupBy('user.id')                  // Group by user to avoid duplicates
            .getMany();
    }

    getAll() {
        return this.chatRepository
            .createQueryBuilder('chat')
            .leftJoin('chat.sender', 'sender')
            .select([
                'chat.id as id',
                'chat.type as type',
                'chat.message as message',
                'chat.createdAt as "createdAt"',
                'chat.isSeen as "isSeen"',
                'sender.id AS "senderId"'
            ])
            .getRawMany();
    }
}
