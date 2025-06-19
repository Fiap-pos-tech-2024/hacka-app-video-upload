import { PrismaClient } from '@prisma/client'

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['error', 'warn', 'info'],
    })
  }

  async connect() {
    await this.$connect()
    console.log('Prisma connected')
  }

  async disconnect() {
    await this.$disconnect()
    console.log('Prisma disconnected')
  }
}
