import { VideoFile } from '@core/domain/entities/video-file'

export interface IVideoRepository {
    saveVideo(video: VideoFile): Promise<void>;
    deleteVideo(savedName: string): Promise<void>;
}