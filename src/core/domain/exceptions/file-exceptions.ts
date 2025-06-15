export class InvalidFileTypeException extends Error {
  constructor(message = 'Invalid video file type') {
    super(message);
    this.name = 'InvalidFileTypeException';
  }
}

export class FileSizeExceededException extends Error {
  constructor(message = 'File size exceeds 1GB') {
    super(message);
    this.name = 'FileSizeExceededException';
  }
}
