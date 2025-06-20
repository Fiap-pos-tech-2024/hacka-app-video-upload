export interface IVideoStorage {
    deleteVideo(savedVideoName: string): Promise<void>;
}