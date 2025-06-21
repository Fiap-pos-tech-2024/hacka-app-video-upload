import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoNotFoundException } from '@core/domain/exceptions/video-exceptions'

interface FindAllVideoUseCaseDto {
  query: {
    customerId?: string
  }
}

export class FindAllVideoUseCase {
    constructor(private readonly videoMetadataRepository: IVideoMetadataRepository) {}

    async execute(dto: FindAllVideoUseCaseDto): Promise<VideoPresenter[]> {
        const videos = await this.videoMetadataRepository.findAllVideos(dto.query)

        if (!videos) {
            throw new VideoNotFoundException('Videos not found')
        }

        return videos.map(video => VideoPresenter.fromDomain(video))
    }
}