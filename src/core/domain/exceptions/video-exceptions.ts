export class InvalidVideoStatusException extends Error {
  constructor(message = 'Invalid video status') {
    super(message)
    this.name = 'InvalidVideoStatusException'
  }
}

export class VideoNotFoundException extends Error {
  constructor(message = 'Video not found') {
    super(message)
    this.name = 'VideoNotFoundException'
  }
}