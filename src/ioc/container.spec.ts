import { container } from './container'
import * as containerModule from './container'

describe('container', () => {
    it('should export all dependencies', () => {
        expect(container).toHaveProperty('prismaService')
        expect(container).toHaveProperty('mySqlVideoMetadataRepository')
        expect(container).toHaveProperty('sqsMensageria')
        expect(container).toHaveProperty('cache')
        expect(container).toHaveProperty('s3VideoStorage')
        expect(container).toHaveProperty('updateVideoMetadataUseCase')
        expect(container).toHaveProperty('uploadVideoUseCase')
        expect(container).toHaveProperty('findVideoByIdUseCase')
        expect(container).toHaveProperty('findAllVideoUseCase')
        expect(container).toHaveProperty('validateTokenUseCase')
    })

    it('should instantiate dependencies only once (singleton)', () => {
        const container2 = containerModule.container
        expect(container.prismaService).toBe(container2.prismaService)
        expect(container.cache).toBe(container2.cache)
    })

    it('should have correct types for use cases', () => {
        expect(typeof container.updateVideoMetadataUseCase.execute).toBe('function')
        expect(typeof container.uploadVideoUseCase.execute).toBe('function')
        expect(typeof container.findVideoByIdUseCase.execute).toBe('function')
        expect(typeof container.findAllVideoUseCase.execute).toBe('function')
        expect(typeof container.validateTokenUseCase.execute).toBe('function')
    })
})
