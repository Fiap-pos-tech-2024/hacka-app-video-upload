import { VideoFile } from '@core/domain/entities/video-file'

export interface IVideoStorage {
    saveVideo(video: VideoFile): Promise<void>;
    deleteVideo(savedVideoName: string): Promise<void>;
}