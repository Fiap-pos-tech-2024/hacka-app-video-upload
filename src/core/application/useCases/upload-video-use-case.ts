import { VideoFile } from "@core/domain/entities/video-file";
import { getFileSize, getFileType } from "@core/application/utils/file-utils";
import { VideoPresenter } from "@adapter/driver/http/presenters/video-presenter";

export class UploadVideoUseCase {
    // constructor(parameters) {
        
    // }
    execute({ filePath, originalName }: { filePath: string, originalName: string }): VideoPresenter {
        const fileSize = getFileSize(filePath);
        const fileType = getFileType(filePath);

        const file = new VideoFile({
            originalName,
            filePath,
            size: fileSize,
            type: fileType,
        });

        return VideoPresenter.fromDomain(file);
    }
}
