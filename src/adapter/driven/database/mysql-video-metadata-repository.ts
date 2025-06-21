import { PrismaService } from './prisma/prisma.service'
import { SaveVideoMetadataDTO } from '@core/application/dtos/save-video-metadata-dto'
import { IVideoMetadataRepository } from '@core/application/ports/video-metadata-repository'
import { VideoFilePrismaMapper } from './mappers/video-file-prisma-mapper'
import { VideoFile } from '@core/domain/entities/video-file'
import { UpdateVideoMetadataDTO } from '@core/application/dtos/update-video-metadata-dto'

export default class MySqlVideoMetadataRepository implements IVideoMetadataRepository {
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

    async updateVideo(dto: UpdateVideoMetadataDTO): Promise<VideoFile> {
        const data: Partial<{ status: string; savedZipKey: string }> = {
            status: dto.status,
            savedZipKey: dto.savedZipKey
        }
        const updatedVideo = await this.prisma.video.update({
            where: { id: dto.id },
            data
        })
        return VideoFilePrismaMapper.toDomain(updatedVideo)
    }

    async findVideoById(id: string): Promise<VideoFile | null> {
        const video = await this.prisma.video.findUnique({
            where: { id }
        })
        if (!video) return null
        return VideoFilePrismaMapper.toDomain(video)
    }
}