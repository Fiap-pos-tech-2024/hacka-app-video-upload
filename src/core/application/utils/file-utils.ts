import * as fs from 'fs';

export function getFileSize(filePath: string): number {
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
