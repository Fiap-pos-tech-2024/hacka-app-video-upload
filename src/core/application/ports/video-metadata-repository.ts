import { SaveVideoMetadataDTO } from '../dtos/save-video-metadata-dto'

export interface IVideoMetadataRepository  {
    saveVideo(dto: SaveVideoMetadataDTO): Promise<void>;
    deleteVideoById(id: string): Promise<void>;
}