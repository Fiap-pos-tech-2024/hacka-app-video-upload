import { Prisma } from '@prisma/client'
import { SaveVideoMetadataDTO } from '@core/application/dtos/save-video-metadata-dto'

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
}
