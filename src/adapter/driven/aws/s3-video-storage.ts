import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { BUCKET_NAME, S3_CLIENT } from '@adapter/driven/aws/config/s3-configs'

import { IVideoStorage } from '@core/application/ports/video-storage'

export default class S3VideoStorage implements IVideoStorage {
    private readonly s3 = S3_CLIENT

    async deleteVideo(savedVideoName: string): Promise<void> {
        try {
            await this.s3.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: savedVideoName,
            }))
        } catch (error) {
            console.error('Failed to delete video on S3: ', error)
        }
    }
}