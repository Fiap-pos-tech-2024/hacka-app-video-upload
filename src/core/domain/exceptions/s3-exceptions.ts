export class S3UploadException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'S3UploadException';
    }
}
