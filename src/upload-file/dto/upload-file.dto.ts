export class UploadFileDto {
    id: string;
    filename: string;
    originalName: string;
    documentType: string;
    size: number;
    uploadedAt: Date;
    url: string;
}
