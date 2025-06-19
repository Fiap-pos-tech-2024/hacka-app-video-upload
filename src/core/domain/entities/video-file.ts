import path from 'path'
import { VideoFileStatus } from '../enums/video-file-status'
import { UniqueEntityId } from '../valueObjects/unique-entity-id'
import { FileSizeExceededException, InvalidFileTypeException } from '../exceptions/file-exceptions'

export class VideoFile {
  private id: UniqueEntityId
  
  readonly originalVideoName: string
  readonly savedVideoName: string
  readonly filePath: string
  readonly size: number
  readonly type: string
  readonly status: VideoFileStatus

  static readonly maxSize = 1024 * 1024 * 1024 // 1GB
  static readonly validVideoTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']

  constructor({ 
    originalVideoName, 
    filePath, 
    size, 
    type,
    id
  }: { filePath: string; size: number; type: string; originalVideoName: string; id?: string }) {
    this.originalVideoName = originalVideoName
    this.savedVideoName =  path.basename(filePath)
    this.filePath = filePath
    this.size = size
    this.type = type
    this.status = VideoFileStatus.CREATED
    this.id = new UniqueEntityId(id)
    this.validate()
  }

  public getId(): string {
    return this.id.getValue()
  }

  private validate() {    
    if (this.size > VideoFile.maxSize) {
      throw new FileSizeExceededException('File size exceeds 1GB')
    }

    if (!VideoFile.validVideoTypes.includes(this.type)) {
      throw new InvalidFileTypeException('Invalid video file type')
    }
  }
}
