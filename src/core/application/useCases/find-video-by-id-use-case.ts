import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoNotFoundException } from '@core/domain/exceptions/video-exceptions'
import { ICache } from '../ports/cache'

interface FindVideoByIdUseCaseDto {
  id: string;
}

export class FindVideoByIdUseCase {
    constructor(
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly cache: ICache
    ) {}

    async execute(dto: FindVideoByIdUseCaseDto): Promise<VideoPresenter> {
        const cacheKey = `video:${dto.id}`
        let existingVideo = await this.cache.get<VideoPresenter>(cacheKey)

        if (existingVideo) {
            return existingVideo
        }

        const video = await this.videoMetadataRepository.findVideoById(dto.id)
        if (!video) {
            throw new VideoNotFoundException('Video not found')
        }
        
        existingVideo = VideoPresenter.fromDomain(video)
        await this.cache.set(cacheKey, existingVideo, 60)
        return existingVideo
    }
}