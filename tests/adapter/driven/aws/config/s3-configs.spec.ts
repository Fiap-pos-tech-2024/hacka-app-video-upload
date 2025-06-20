describe('s3-configs', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('exporta BUCKET_NAME da env', async () => {
    process.env.AWS_BUCKET_NAME = 'meu-bucket'
    jest.resetModules()
    const { BUCKET_NAME } = await import('@adapter/driven/aws/config/s3-configs')
    expect(BUCKET_NAME).toBe('meu-bucket')
  })

  it('exporta BUCKET_NAME default se env não definida', async () => {
    delete process.env.AWS_BUCKET_NAME
    jest.resetModules()
    const { BUCKET_NAME } = await import('@adapter/driven/aws/config/s3-configs')
    expect(BUCKET_NAME).toBe('default-bucket-name')
  })

  it('instancia S3_CLIENT com região da env', async () => {
    process.env.AWS_REGION = 'sa-east-1'
    jest.resetModules()
    const { S3_CLIENT } = await import('@adapter/driven/aws/config/s3-configs')
    
    const endpoint = S3_CLIENT.config.endpoint
    expect(endpoint).toBeUndefined()
    expect(S3_CLIENT.constructor.name).toBe('S3Client')
    const region = await S3_CLIENT.config.region()
    expect(region).toBe('sa-east-1')
  })

  it('usa endpoint customizado e forcePathStyle se ENVIRONMENT=local', async () => {
    process.env.ENVIRONMENT = 'local'
    process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
    jest.resetModules()
    const { S3_CLIENT } = await import('@adapter/driven/aws/config/s3-configs')

    const endpointObj = await S3_CLIENT.config.endpoint!()
    const { protocol, hostname, port } = endpointObj

    expect(protocol).toBe('http:')
    expect(hostname).toBe('localhost')
    expect(port).toBe(4566)
    expect(S3_CLIENT.config.forcePathStyle).toBe(true)
  })

  it('deve validar ENVIRONMENT corretamente para "local" e "production"', async () => {
    process.env.AWS_REGION = 'sa-east-1'
    process.env.ENVIRONMENT = 'local'
    process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
    jest.resetModules()
    const { S3_CLIENT } = await import('@adapter/driven/aws/config/s3-configs')
    const endpointObj = await S3_CLIENT.config.endpoint!()
    const { protocol, hostname, port } = endpointObj

    expect(protocol).toBe('http:')
    expect(hostname).toBe('localhost')
    expect(port).toBe(4566)
    expect(S3_CLIENT.config.forcePathStyle).toBe(true)

    process.env.ENVIRONMENT = 'production'
    jest.resetModules()
    const { S3_CLIENT: prodS3Client } = await import('@adapter/driven/aws/config/s3-configs')
    const prodEndpointObj = prodS3Client.config.endpoint
    expect(prodEndpointObj).toBeUndefined()
    expect(prodS3Client.config.forcePathStyle).toBeFalsy()
})
})
