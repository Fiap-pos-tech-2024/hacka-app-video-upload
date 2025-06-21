import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { ICache } from '../ports/cache'

interface FindAllVideoUseCaseDto {
  query: {
    customerId?: string
  }
}

export class FindAllVideoUseCase {
    constructor(
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly cache: ICache
    ) {}

    async execute(dto: FindAllVideoUseCaseDto): Promise<VideoPresenter[]> {
        const { customerId } = dto.query

        if (!customerId) {
            const videos = await this.videoMetadataRepository.findAllVideos({})
            return videos.map(VideoPresenter.fromDomain)
        }

        const cacheKey = `videos:customer:${customerId}`
        const cachedList = await this.cache.get<VideoPresenter[]>(cacheKey)
        if (cachedList) {
            return cachedList
        }
        
        const videos = await this.videoMetadataRepository.findAllVideos({ customerId })
        const presenter = videos.map(VideoPresenter.fromDomain)
        await this.cache.set(cacheKey, presenter, 60)
        return presenter
    }
}