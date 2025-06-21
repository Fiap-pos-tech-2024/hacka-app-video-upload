import { VideoFileStatus } from '../enums/video-file-status'
import { UniqueEntityId } from '../valueObjects/unique-entity-id'
import { InvalidFileTypeException } from '../exceptions/file-exceptions'

interface VideoFileProps {
  originalVideoName: string
  savedVideoKey: string
  customerId?: string
  savedZipKey?: string | null
  mimeType?: string
  status?: VideoFileStatus
  createdAt?: Date | string
  updatedAt?: Date | string
  id?: string
}

export class VideoFile {
  private id: UniqueEntityId
  
  readonly originalVideoName: string
  readonly savedVideoKey: string
  readonly savedZipKey?: string | null
  readonly customerId?: string
  readonly mimeType?: string
  readonly status: VideoFileStatus
  readonly createdAt?: Date | string
  readonly updatedAt?: Date | string

  static readonly validMimeTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']

  constructor({ 
    originalVideoName, 
    savedVideoKey,
    mimeType,
    customerId,
    savedZipKey,
    status = VideoFileStatus.CREATED,
    createdAt,
    updatedAt,
    id
  }: VideoFileProps) {
    this.originalVideoName = originalVideoName
    this.savedVideoKey =  savedVideoKey
    this.mimeType = mimeType
    this.customerId = customerId
    this.savedZipKey = savedZipKey
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.status = status
    this.id = new UniqueEntityId(id)
    this.validate()
  }

  public getId(): string {
    return this.id.getValue()
  }

  private validate() {
    if (this.mimeType && !VideoFile.validMimeTypes.includes(this.mimeType)) {
      throw new InvalidFileTypeException('Invalid video file type')
    }
  }
}
