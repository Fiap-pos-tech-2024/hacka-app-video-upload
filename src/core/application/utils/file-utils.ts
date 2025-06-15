import * as fs from 'fs';

export function getFileSize(filePath: string): number {
    if (!fs.existsSync(filePath)) {
        return 0;
    }
    const stats = fs.statSync(filePath);
    return stats.size;
}

export function getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'mp4':
            return 'video/mp4';
        case 'mpeg':
        case 'mpg':
            return 'video/mpeg';
        case 'avi':
            return 'video/avi';
        case 'mkv':
            return 'video/mkv';
        default:
            return 'unknown';
    }
}

export function removeFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
