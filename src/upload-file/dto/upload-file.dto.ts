import {FileStatusEnum} from "../enums/file-status.enum";

export class UploadFileDto {
    id: string;
    filename: string;
    originalName: string;
    documentType: string;
    size: number;
    uploadedAt: Date;
    url: string;
    status: FileStatusEnum;
    rejectionReason?: string;
}
