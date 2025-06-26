import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'
import { RedisCache } from '@adapter/driven/cache/redis-cache'
import MySqlVideoMetadataRepository from '@adapter/driven/database/mysql-video-metadata-repository'
import { PrismaService } from '@adapter/driven/database/prisma/prisma.service'
import { UpdateVideoMetadataUseCase } from '@core/application/useCases/update-video-metadata-use-case'
import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import { FindVideoByIdUseCase } from '@core/application/useCases/find-video-by-id-use-case'
import { FindAllVideoUseCase } from '@core/application/useCases/find-all-video-use-case'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'

const sqsMensageria = new SqsMensageria()
const cache = new RedisCache()
const s3VideoStorage = new S3VideoStorage()
const prismaService = new PrismaService()
const mySqlVideoMetadataRepository = new MySqlVideoMetadataRepository(prismaService)

const updateVideoMetadataUseCase = new UpdateVideoMetadataUseCase(mySqlVideoMetadataRepository, cache)
const uploadVideoUseCase = new UploadVideoUseCase(
    s3VideoStorage,
    mySqlVideoMetadataRepository,
    sqsMensageria,
    cache
)
const findVideoByIdUseCase = new FindVideoByIdUseCase(mySqlVideoMetadataRepository, cache)
const findAllVideoUseCase = new FindAllVideoUseCase(mySqlVideoMetadataRepository, cache)

export const container = {
    prismaService,
    mySqlVideoMetadataRepository,
    sqsMensageria,
    cache,
    s3VideoStorage,
    updateVideoMetadataUseCase,
    uploadVideoUseCase,
    findVideoByIdUseCase,
    findAllVideoUseCase
}
