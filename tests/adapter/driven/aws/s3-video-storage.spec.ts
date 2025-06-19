import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { VideoFile } from '@core/domain/entities/video-file'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'
import { S3UploadException } from '@core/domain/exceptions/s3-exceptions'

jest.mock('@aws-sdk/client-s3')
jest.mock('fs', () => ({
  createReadStream: jest.fn(() => 'stream'),
  promises: {},
}))

describe('S3VideoStorage', () => {
  const videoMock = {
    filePath: '/tmp/video.mp4',
    savedVideoName: 'video.mp4',
    originalVideoName: 'original.mp4',
    type: 'video/mp4',
    size: 123,
  } as unknown as VideoFile

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_BUCKET_NAME = 'bucket-test'
    process.env.ENVIRONMENT = ''
  })

  it('deve instanciar S3Client e bucket corretamente', () => {
    const storage = new S3VideoStorage()
    expect(S3Client).toHaveBeenCalledWith({ region: 'us-east-1' })
    expect(storage['bucketName']).toBe('bucket-test')
  })

  it('deve instanciar o S3Client com endpoint local se ENVIRONMENT=local', () => {
      process.env.AWS_REGION = 'sa-east-1'
      process.env.ENVIRONMENT = 'local'
      process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
      new S3VideoStorage()
      expect(S3Client).toHaveBeenCalledWith({ 
        region: 'sa-east-1', endpoint: 'http://localhost:4566', forcePathStyle: true
      })
    })

  it('deve enviar vídeo para o S3 com os parâmetros corretos', async () => {
    const sendMock = jest.fn().mockResolvedValue({})
    ;(S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }))
    const storage = new S3VideoStorage()
    await storage.saveVideo(videoMock)
    expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    const callArg = (PutObjectCommand as unknown as jest.Mock).mock.calls[0][0]
    expect(callArg.Bucket).toBe('bucket-test')
    expect(callArg.Key).toBe('video.mp4')
    expect(callArg.Body).toBe('stream')
    expect(callArg.ContentType).toBe('video/mp4')
    expect(callArg.Tagging).toContain('originalVideoName=original.mp4')
    expect(callArg.Metadata.originalVideoName).toBe('original.mp4')
  })

  it('deve lançar S3UploadException se falhar upload', async () => {
    const sendMock = jest.fn().mockRejectedValue(new Error('fail'))
    ;(S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }))
    const storage = new S3VideoStorage()
    await expect(storage.saveVideo(videoMock)).rejects.toThrow(S3UploadException)
  })

  it('deve chamar DeleteObjectCommand ao deletar vídeo', async () => {
    const sendMock = jest.fn().mockResolvedValue({})
    ;(S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }))
    const storage = new S3VideoStorage()
    await storage.deleteVideo('video.mp4')
    expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
    const callArg = (DeleteObjectCommand as unknown as jest.Mock).mock.calls[0][0]
    expect(callArg.Bucket).toBe('bucket-test')
    expect(callArg.Key).toBe('video.mp4')
  })

  it('deve apenas logar erro ao falhar deleteVideo', async () => {
    const sendMock = jest.fn().mockRejectedValue(new Error('fail'))
    ;(S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }))
    const storage = new S3VideoStorage()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await storage.deleteVideo('video.mp4')
    expect(spy).toHaveBeenCalledWith('Erro ao deletar vídeo do S3:', expect.any(Error))
    spy.mockRestore()
  })
})
