import { S3_CLIENT } from '@adapter/driven/aws/config/s3-configs'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'

jest.mock('@adapter/driven/aws/config/s3-configs', () => ({
  BUCKET_NAME: 'bucket-test',
  S3_CLIENT: { send: jest.fn() }
}))

describe('S3VideoStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve chamar DeleteObjectCommand ao deletar vídeo', async () => {
    (S3_CLIENT.send as jest.Mock).mockResolvedValue({})
    const storage = new S3VideoStorage()
    await storage.deleteVideo('video.mp4')
    expect(S3_CLIENT.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
    const command = (S3_CLIENT.send as jest.Mock).mock.calls[0][0]
    expect(command.input.Bucket).toBe('bucket-test')
    expect(command.input.Key).toBe('video.mp4')
  })

  it('deve apenas logar erro ao falhar deleteVideo', async () => {
    (S3_CLIENT.send as jest.Mock).mockRejectedValue(new Error('fail'))
    const storage = new S3VideoStorage()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await storage.deleteVideo('video.mp4')
    expect(spy).toHaveBeenCalledWith('Failed to delete video on S3: ', expect.any(Error))
    spy.mockRestore()
  })
})
