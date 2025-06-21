import { VideoFileStatus } from '@core/domain/enums/video-file-status'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { 
    InvalidVideoStatusException, VideoNotFoundException 
} from '@core/domain/exceptions/video-exceptions'

interface UpdateVideoMetadataUseCaseDto {
  id: string;
  status: string;
  savedZipKey?: string;
}

export class UpdateVideoMetadataUseCase {
    constructor(private readonly videoMetadataRepository: IVideoMetadataRepository) {}

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

        return VideoPresenter.fromDomain(updatedVideoMetadata)
    }
}
