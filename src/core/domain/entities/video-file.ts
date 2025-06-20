import { VideoFileStatus } from '../enums/video-file-status'
import { UniqueEntityId } from '../valueObjects/unique-entity-id'
import { InvalidFileTypeException } from '../exceptions/file-exceptions'

export class VideoFile {
  private id: UniqueEntityId
  
  readonly originalVideoName: string
  readonly savedVideoKey: string
  readonly mimeType: string
  readonly status: VideoFileStatus

  static readonly validMimeTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']

  constructor({ 
    originalVideoName, 
    savedVideoKey,
    mimeType,
    id
  }: { originalVideoName: string; savedVideoKey: string; mimeType: string; id?: string }) {
    this.originalVideoName = originalVideoName
    this.savedVideoKey =  savedVideoKey
    this.mimeType = mimeType
    this.status = VideoFileStatus.CREATED
    this.id = new UniqueEntityId(id)
    this.validate()
  }

  public getId(): string {
    return this.id.getValue()
  }

  private validate() {
    if (!VideoFile.validMimeTypes.includes(this.mimeType)) {
      throw new InvalidFileTypeException('Invalid video file type')
    }
  }
}
