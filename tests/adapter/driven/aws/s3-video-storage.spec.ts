const mocks = {
    sendMock: undefined as unknown as jest.Mock,
}

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'

jest.mock('@adapter/driven/aws/config/s3-configs', () => {
    mocks.sendMock = jest.fn()
    return {
        BUCKET_NAME: 'bucket-test',
        S3_CLIENT: { send: mocks.sendMock }
    }
})

describe('S3VideoStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mocks.sendMock.mockReset()
    })

    it('deve chamar DeleteObjectCommand ao deletar vídeo', async () => {
        mocks.sendMock.mockResolvedValue({})
        const storage = new S3VideoStorage()
        await storage.deleteVideo('video.mp4')
        expect(mocks.sendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
        const command = mocks.sendMock.mock.calls[0][0]
        expect(command.input.Bucket).toBe('bucket-test')
        expect(command.input.Key).toBe('video.mp4')
    })

    it('deve apenas logar erro ao falhar deleteVideo', async () => {
        mocks.sendMock.mockRejectedValue(new Error('fail'))
        const storage = new S3VideoStorage()
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
        await storage.deleteVideo('video.mp4')
        expect(spy).toHaveBeenCalledWith('Failed to delete video on S3: ', expect.any(Error))
        spy.mockRestore()
    })
})
