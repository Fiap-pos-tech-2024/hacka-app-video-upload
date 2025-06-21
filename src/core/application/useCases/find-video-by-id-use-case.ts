import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoNotFoundException } from '@core/domain/exceptions/video-exceptions'

interface FindVideoByIdUseCaseDto {
  id: string;
}

export class FindVideoByIdUseCase {
    constructor(private readonly videoMetadataRepository: IVideoMetadataRepository) {}

    async execute(dto: FindVideoByIdUseCaseDto): Promise<VideoPresenter> {
        const existingVideo = await this.videoMetadataRepository.findVideoById(dto.id)
    
        if (!existingVideo) {
            throw new VideoNotFoundException('Video not found')
        }

        return VideoPresenter.fromDomain(existingVideo)
    }
}