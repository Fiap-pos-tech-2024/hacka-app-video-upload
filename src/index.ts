import { HackaAPI } from '@adapter/driver/http/server'
import { UpdatedVideoProcessingListener } from '@adapter/driver/listener/updated-video-processing-listener'
import { container } from '@ioc/container'

// Stryker disable all
// Starta a API
HackaAPI.start()

// Starta o listener do SQS
const updatedVideoProcessingListener = new UpdatedVideoProcessingListener(
    container.sqsMensageria,
    container.updateVideoMetadataUseCase
)

updatedVideoProcessingListener.listen()
