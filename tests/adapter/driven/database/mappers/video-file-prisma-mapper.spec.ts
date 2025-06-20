import { VideoFilePrismaMapper } from '@adapter/driven/database/mappers/video-file-prisma-mapper'

describe('VideoFilePrismaMapper', () => {
  it('deve mapear SaveVideoMetadataDTO para VideoUncheckedCreateInput', () => {
    const dto = {
      savedVideoKey: 'saved.mp4',
      originalVideoName: 'original.mp4',
      customerId: 'customer-1',
      status: 'CREATED',
      id: 'id-123',
    }
    const result = VideoFilePrismaMapper.toPrisma(dto)
    expect(result).toEqual(dto)
  })
})
