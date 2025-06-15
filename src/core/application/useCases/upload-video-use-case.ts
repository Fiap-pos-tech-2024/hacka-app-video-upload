import { VideoFile } from "@core/domain/entities/video-file";
import { IVideoRepository } from "../ports/video-repository";
import { getFileSize, getFileType, removeFile } from "@core/application/utils/file-utils";
import { VideoPresenter } from "@adapter/driver/http/presenters/video-presenter";
import { InvalidFileException } from "@core/domain/exceptions/file-exceptions";

export class UploadVideoUseCase {
    constructor(private readonly videoRepository: IVideoRepository) {}

    async execute({ filePath, originalName }: { filePath: string, originalName: string }): Promise<VideoPresenter> {
        try {
            const fileSize = getFileSize(filePath);
            const fileType = getFileType(filePath);

            if (fileSize === 0 || fileType === 'unknown') {
                throw new InvalidFileException('File is empty or does not exist.');
            }

            const file = new VideoFile({
                originalName,
                filePath,
                size: fileSize,
                type: fileType,
            });
        
            await this.videoRepository.saveVideo(file);
            
            return VideoPresenter.fromDomain(file);
        } catch (error) {
            removeFile(filePath);
            throw error;
        }
    }
}
