import { VideoFile } from '@core/domain/entities/video-file'
import { SaveVideoMetadataDTO } from '../dtos/save-video-metadata-dto'
import { UpdateVideoMetadataDTO } from '../dtos/update-video-metadata-dto'

export interface IVideoMetadataRepository  {
    saveVideo(dto: SaveVideoMetadataDTO): Promise<void>;
    deleteVideoById(id: string): Promise<void>;
    updateVideo(dto: UpdateVideoMetadataDTO): Promise<VideoFile>;
    findVideoById(id: string): Promise<VideoFile | null>;
}