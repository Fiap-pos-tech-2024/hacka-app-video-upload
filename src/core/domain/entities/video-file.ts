import path from 'path'
import { FileSizeExceededException, InvalidFileTypeException } from '../exceptions/file-exceptions'
export class VideoFile {
  readonly originalName: string
  readonly savedName: string
  readonly filePath: string
  readonly size: number
  readonly type: string

  static readonly maxSize = 1024 * 1024 * 1024 // 1GB
  static readonly validVideoTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']

  constructor({ 
    originalName, 
    filePath, 
    size, 
    type 
  }: { filePath: string; size: number; type: string; originalName: string; }) {
    this.originalName = originalName
    this.savedName =  path.basename(filePath)
    this.filePath = filePath
    this.size = size
    this.type = type
    this.validate()
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
