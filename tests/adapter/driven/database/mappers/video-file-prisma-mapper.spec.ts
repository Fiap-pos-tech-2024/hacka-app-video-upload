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

  it('deve mapear VideoUncheckedCreateInput para VideoFile (toDomain)', () => {
    const prismaInput = {
      id: 'id-456',
      savedVideoKey: 'video.mp4',
      savedZipKey: 'video.zip',
      originalVideoName: 'orig.mp4',
      customerId: 'customer-2',
      status: 'DONE',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z')
    }
    const domain = VideoFilePrismaMapper.toDomain(prismaInput as any)
    expect(domain).toBeDefined()
    expect(domain).toHaveProperty('id', { 'value': 'id-456' })
    expect(domain).toHaveProperty('savedVideoKey', 'video.mp4')
    expect(domain).toHaveProperty('savedZipKey', 'video.zip')
    expect(domain).toHaveProperty('originalVideoName', 'orig.mp4')
    expect(domain).toHaveProperty('customerId', 'customer-2')
    expect(domain).toHaveProperty('status', 'DONE')
    expect(domain).toHaveProperty('createdAt', new Date('2024-01-01T00:00:00Z'))
    expect(domain).toHaveProperty('updatedAt', new Date('2024-01-02T00:00:00Z'))
  })
})
