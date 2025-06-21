import { randomUUID } from 'node:crypto'

export class UniqueEntityId {
    private readonly value: string

    constructor(value?: string) {
        this.value = value ?? randomUUID()
    }

    public getValue(): string {
        return this.value
    }
}
