import PostgresVideoMetadataRepository from '@adapter/driven/database/postgres-video-metadata-repository'
import { VideoFilePrismaMapper } from '@adapter/driven/database/mappers/video-file-prisma-mapper'

describe('PostgresVideoMetadataRepository', () => {
  const prismaMock = {
    video: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve salvar vídeo usando o prisma e o mapper', async () => {
    const dto = { foo: 'bar' } as any
    const mapped = {
      savedVideoName: 'saved.mp4',
      originalVideoName: 'original.mp4',
      customerId: 'customer-1',
      status: 'CREATED',
    }
    jest.spyOn(VideoFilePrismaMapper, 'toPrisma').mockReturnValue(mapped)
    const repo = new PostgresVideoMetadataRepository(prismaMock as any)
    await repo.saveVideo(dto)
    expect(VideoFilePrismaMapper.toPrisma).toHaveBeenCalledWith(dto)
    expect(prismaMock.video.create).toHaveBeenCalledWith({ data: mapped })
  })

  it('deve lançar exceção se prisma.video.create falhar', async () => {
    const dto = { foo: 'bar' } as any
    const mapped = {
      savedVideoName: 'saved.mp4',
      originalVideoName: 'original.mp4',
      customerId: 'customer-1',
      status: 'CREATED',
    }
    jest.spyOn(VideoFilePrismaMapper, 'toPrisma').mockReturnValue(mapped)
    prismaMock.video.create.mockRejectedValue(new Error('erro prisma'))
    const repo = new PostgresVideoMetadataRepository(prismaMock as any)
    await expect(repo.saveVideo(dto)).rejects.toThrow('erro prisma')
  })

  it('deve deletar vídeo por id', async () => {
    const repo = new PostgresVideoMetadataRepository(prismaMock as any)
    await repo.deleteVideoById('id-123')
    expect(prismaMock.video.delete).toHaveBeenCalledWith({ where: { id: 'id-123' } })
  })

  it('deve lançar exceção se prisma.video.delete falhar', async () => {
    prismaMock.video.delete.mockRejectedValue(new Error('erro delete'))
    const repo = new PostgresVideoMetadataRepository(prismaMock as any)
    await expect(repo.deleteVideoById('id-123')).rejects.toThrow('erro delete')
  })
})
