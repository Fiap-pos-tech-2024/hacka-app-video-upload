import { VideoFileStatus } from '@core/domain/enums/video-file-status'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { 
    InvalidVideoStatusException, VideoNotFoundException 
} from '@core/domain/exceptions/video-exceptions'
import { ICache } from '../ports/cache'
import { UpdateVideoMetadataUseCaseDto } from '../dtos/update-video-metadata-use-case-dto'

export class UpdateVideoMetadataUseCase {
    constructor(
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly cache: ICache
    ) {}

    async execute(dto: UpdateVideoMetadataUseCaseDto): Promise<VideoPresenter> {
        if (!dto.status) {
            throw new InvalidVideoStatusException('Missing video status')
        }

        if (!Object.values(VideoFileStatus).includes(dto.status as VideoFileStatus)) {
            throw new InvalidVideoStatusException('Invalid video status value')
        }

        const existingVideo = await this.videoMetadataRepository.findVideoById(dto.id)
        if (!existingVideo) {
            throw new VideoNotFoundException('Video not found')
        }

        const updatedVideoMetadata = await this.videoMetadataRepository.updateVideo(dto)

        // Invalida o cache do vídeo e da lista do cliente
        await this.cache.del(`video:${dto.id}`)       
        await this.cache.del(`videos:customer:${existingVideo.customerId}`)

        return VideoPresenter.fromDomain(updatedVideoMetadata)
    }
}
