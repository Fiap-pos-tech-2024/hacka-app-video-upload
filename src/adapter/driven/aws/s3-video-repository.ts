import fs from 'fs';
import { 
    PutObjectCommand, 
    PutObjectCommandInput, 
    S3Client, 
    DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { VideoFile } from "@core/domain/entities/video-file";
import { IVideoRepository } from "@core/application/ports/video-repository";
import { S3UploadException } from '@core/domain/exceptions/s3-exceptions';

export default class S3VideoRepository implements IVideoRepository {
    private readonly s3: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION ?? 'us-east-1',
            ...(process.env.ENVIRONMENT === 'local'
                ? { endpoint: process.env.AWS_LOCAL_ENDPOINT, forcePathStyle: true }
                : {}),
        });
        this.bucketName = process.env.AWS_BUCKET_NAME ?? 'default-bucket-name';
    }

    async saveVideo(video: VideoFile): Promise<void> {
        try {
            const videoFileStream = fs.createReadStream(video.filePath);

            const uploadParams: PutObjectCommandInput = {
                Bucket: this.bucketName,
                Key: video.savedName,
                Body: videoFileStream,
                ContentType: video.type,
                Tagging: `originalName=${video.originalName}`,
                Metadata: {
                    originalName: video.originalName,
                    type: video.type,
                    size: video.size.toString(),
                },
            };

            await this.s3.send(new PutObjectCommand(uploadParams));
        } catch (error: any) {
            console.error('Erro ao fazer upload do vídeo para o S3:', error);
            throw new S3UploadException('Video upload failed.');
        }
    }

    async deleteVideo(savedName: string): Promise<void> {
        try {
            await this.s3.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: savedName,
            }));
        } catch (error) {
            console.error('Erro ao deletar vídeo do S3:', error);
        }
    }
}