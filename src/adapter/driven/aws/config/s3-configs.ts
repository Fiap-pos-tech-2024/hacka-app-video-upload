import { S3Client } from '@aws-sdk/client-s3'

const BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? 'default-bucket-name'
const S3_CLIENT = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    ...(process.env.ENVIRONMENT === 'local'
        ? { endpoint: process.env.AWS_LOCAL_ENDPOINT, forcePathStyle: true }
        : {}),
})

export { BUCKET_NAME, S3_CLIENT }