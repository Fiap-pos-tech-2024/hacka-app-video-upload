export class InvalidFileTypeException extends Error {
  constructor(message = 'Invalid video file type') {
    super(message)
    this.name = 'InvalidFileTypeException'
  }
}
