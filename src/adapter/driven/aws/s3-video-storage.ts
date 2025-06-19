import fs from 'fs'
import { 
    PutObjectCommand, 
    PutObjectCommandInput, 
    S3Client, 
    DeleteObjectCommand 
} from '@aws-sdk/client-s3'
import { VideoFile } from '@core/domain/entities/video-file'
import { IVideoStorage } from '@core/application/ports/video-storage'
import { S3UploadException } from '@core/domain/exceptions/s3-exceptions'

export default class S3VideoStorage implements IVideoStorage {
    private readonly s3: S3Client
    private readonly bucketName: string

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION ?? 'us-east-1',
            ...(process.env.ENVIRONMENT === 'local'
                ? { endpoint: process.env.AWS_LOCAL_ENDPOINT, forcePathStyle: true }
                : {}),
        })
        this.bucketName = process.env.AWS_BUCKET_NAME ?? 'default-bucket-name'
    }

    async saveVideo(video: VideoFile): Promise<void> {
        try {
            const videoFileStream = fs.createReadStream(video.filePath)

            const uploadParams: PutObjectCommandInput = {
                Bucket: this.bucketName,
                Key: video.savedVideoName,
                Body: videoFileStream,
                ContentType: video.type,
                Tagging: `originalVideoName=${video.originalVideoName}`,
                Metadata: {
                    originalVideoName: video.originalVideoName,
                    type: video.type,
                    size: video.size.toString(),
                },
            }

            await this.s3.send(new PutObjectCommand(uploadParams))
        } catch (error: unknown) {
            console.error('Erro ao fazer upload do vídeo para o S3:', error)
            throw new S3UploadException('Video upload failed.')
        }
    }

    async deleteVideo(savedVideoName: string): Promise<void> {
        try {
            await this.s3.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: savedVideoName,
            }))
        } catch (error) {
            console.error('Erro ao deletar vídeo do S3:', error)
        }
    }
}