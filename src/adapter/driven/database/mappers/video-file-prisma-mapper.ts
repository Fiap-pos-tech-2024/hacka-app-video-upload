import { Prisma } from '@prisma/client'
import { SaveVideoMetadataDTO } from '@core/application/dtos/save-video-metadata-dto'
import { VideoFile } from '@core/domain/entities/video-file'

export class VideoFilePrismaMapper {
    static toPrisma(video: SaveVideoMetadataDTO): Prisma.VideoUncheckedCreateInput {
        return {
            savedVideoKey: video.savedVideoKey,
            originalVideoName: video.originalVideoName,
            customerId: video.customerId,
            status: video.status,
            id: video.id
        }
    }

    static toDomain(video: Prisma.VideoUncheckedCreateInput): VideoFile {
        return new VideoFile(
            {
                id: video.id,
                savedVideoKey: video.savedVideoKey,
                savedZipKey: video.savedZipKey,
                originalVideoName: video.originalVideoName,
                customerId: video.customerId,
                status: video.status as VideoFile['status'],
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            }
        )
    }
}
