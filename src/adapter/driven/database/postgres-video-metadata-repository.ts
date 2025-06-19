import { PrismaService } from './prisma/prisma.service'
import { SaveVideoMetadataDTO } from '@core/application/dtos/save-video-metadata-dto'
import { IVideoMetadataRepository } from '@core/application/ports/video-metadata-repository'
import { VideoFilePrismaMapper } from './mappers/video-file-prisma-mapper'

export default class PostgresVideoMetadataRepository implements IVideoMetadataRepository {
    constructor(private readonly prisma: PrismaService) {}
    
    async saveVideo(dto: SaveVideoMetadataDTO): Promise<void> {
        const data = VideoFilePrismaMapper.toPrisma(dto)
        await this.prisma.video.create({
            data
        })
    }

    async deleteVideoById(id: string): Promise<void> {
        await this.prisma.video.delete({
            where: { id }
        })
    }
}