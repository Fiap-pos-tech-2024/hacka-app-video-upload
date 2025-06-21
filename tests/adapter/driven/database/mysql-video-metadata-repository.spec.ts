import MySqlVideoMetadataRepository from '@adapter/driven/database/mysql-video-metadata-repository'
import { VideoFilePrismaMapper } from '@adapter/driven/database/mappers/video-file-prisma-mapper'

describe('MySqlVideoMetadataRepository', () => {
    const prismaMock = {
        video: {
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deve salvar vídeo usando o prisma e o mapper', async () => {
        const dto = { foo: 'bar' } as any
        const mapped = {
            savedVideoKey: 'saved.mp4',
            originalVideoName: 'original.mp4',
            customerId: 'customer-1',
            status: 'CREATED',
        }
        jest.spyOn(VideoFilePrismaMapper, 'toPrisma').mockReturnValue(mapped)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        await repo.saveVideo(dto)
        expect(VideoFilePrismaMapper.toPrisma).toHaveBeenCalledWith(dto)
        expect(prismaMock.video.create).toHaveBeenCalledWith({ data: mapped })
    })

    it('deve lançar exceção se prisma.video.create falhar', async () => {
        const dto = { foo: 'bar' } as any
        const mapped = {
            savedVideoKey: 'saved.mp4',
            originalVideoName: 'original.mp4',
            customerId: 'customer-1',
            status: 'CREATED',
        }
        jest.spyOn(VideoFilePrismaMapper, 'toPrisma').mockReturnValue(mapped)
        prismaMock.video.create.mockRejectedValue(new Error('erro prisma'))
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        await expect(repo.saveVideo(dto)).rejects.toThrow('erro prisma')
    })

    it('deve deletar vídeo por id', async () => {
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        await repo.deleteVideoById('id-123')
        expect(prismaMock.video.delete).toHaveBeenCalledWith({ where: { id: 'id-123' } })
    })

    it('deve lançar exceção se prisma.video.delete falhar', async () => {
        prismaMock.video.delete.mockRejectedValue(new Error('erro delete'))
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        await expect(repo.deleteVideoById('id-123')).rejects.toThrow('erro delete')
    })

    it('deve atualizar vídeo pelo id', async () => {
        const updated = {
            id: 'id-1',
            savedVideoKey: 'saved.mp4',
            savedZipKey: 'saved.zip',
            originalVideoName: 'original.mp4',
            customerId: 'customer-1',
            status: 'DONE',
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
        }
        prismaMock.video.update = jest.fn().mockResolvedValue(updated)
        jest.spyOn(VideoFilePrismaMapper, 'toDomain').mockReturnValue(updated as any)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.updateVideo({ id: 'id-1', status: 'DONE', savedZipKey: 'saved.zip' })
        expect(prismaMock.video.update).toHaveBeenCalledWith({ 
            where: { id: 'id-1' }, 
            data: { status: 'DONE', savedZipKey: 'saved.zip' } })
        expect(VideoFilePrismaMapper.toDomain).toHaveBeenCalledWith(updated)
        expect(result).toBe(updated)
    })

    it('deve atualizar vídeo pelo id sem savedZipKey', async () => {
        const updated = {
            id: 'id-3',
            savedVideoKey: 'saved3.mp4',
            savedZipKey: undefined,
            originalVideoName: 'original3.mp4',
            customerId: 'customer-3',
            status: 'PROCESSING',
            createdAt: new Date('2024-03-01T00:00:00Z'),
            updatedAt: new Date('2024-03-02T00:00:00Z'),
        }
        prismaMock.video.update = jest.fn().mockResolvedValue(updated)
        jest.spyOn(VideoFilePrismaMapper, 'toDomain').mockReturnValue(updated as any)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.updateVideo({ id: 'id-3', status: 'PROCESSING' })
        expect(prismaMock.video.update).toHaveBeenCalledWith({ 
            where: { id: 'id-3' }, 
            data: { status: 'PROCESSING' } })
        expect(VideoFilePrismaMapper.toDomain).toHaveBeenCalledWith(updated)
        expect(result).toBe(updated)
    })

    it('deve buscar vídeo por id', async () => {
        const found = {
            id: 'id-2',
            savedVideoKey: 'saved2.mp4',
            savedZipKey: 'saved2.zip',
            originalVideoName: 'original2.mp4',
            customerId: 'customer-2',
            status: 'CREATED',
            createdAt: new Date('2024-02-01T00:00:00Z'),
            updatedAt: new Date('2024-02-02T00:00:00Z'),
        }
        prismaMock.video.findUnique = jest.fn().mockResolvedValue(found)
        jest.spyOn(VideoFilePrismaMapper, 'toDomain').mockReturnValue(found as any)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.findVideoById('id-2')
        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({ where: { id: 'id-2' } })
        expect(VideoFilePrismaMapper.toDomain).toHaveBeenCalledWith(found)
        expect(result).toBe(found)
    })

    it('deve retornar null se vídeo não encontrado ao buscar por id', async () => {
        prismaMock.video.findUnique = jest.fn().mockResolvedValue(null)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.findVideoById('id-nao-existe')
        expect(result).toBeNull()
    })

    it('deve buscar todos os vídeos', async () => {
        const videos = [
            {
                id: 'id-1',
                savedVideoKey: 'saved1.mp4',
                savedZipKey: 'saved1.zip',
                originalVideoName: 'original1.mp4',
                customerId: 'customer-1',
                status: 'CREATED',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-02T00:00:00Z'),
            },
            {
                id: 'id-2',
                savedVideoKey: 'saved2.mp4',
                savedZipKey: 'saved2.zip',
                originalVideoName: 'original2.mp4',
                customerId: 'customer-2',
                status: 'DONE',
                createdAt: new Date('2024-02-01T00:00:00Z'),
                updatedAt: new Date('2024-02-02T00:00:00Z'),
            },
        ]
        prismaMock.video.findMany = jest.fn().mockResolvedValue(videos)
        jest.spyOn(VideoFilePrismaMapper, 'toDomain').mockImplementation((v) => v as any)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.findAllVideos({})
        expect(prismaMock.video.findMany).toHaveBeenCalled()
        expect(result).toEqual(videos)
    })

    it('deve buscar todos os vídeos filtrando por customerId', async () => {
        const videos = [
            { id: 'id-1', customerId: 'customer-1' },
            { id: 'id-2', customerId: 'customer-2' },
            { id: 'id-3', customerId: 'customer-1' },
        ]
        prismaMock.video.findMany = jest.fn().mockResolvedValue(videos)
        jest.spyOn(VideoFilePrismaMapper, 'toDomain').mockImplementation((v) => v as any)
        const repo = new MySqlVideoMetadataRepository(prismaMock as any)
        const result = await repo.findAllVideos({ customerId: 'customer-1' })
        expect(result).toEqual([
            { id: 'id-1', customerId: 'customer-1' },
            { id: 'id-3', customerId: 'customer-1' },
        ])
    })
})
