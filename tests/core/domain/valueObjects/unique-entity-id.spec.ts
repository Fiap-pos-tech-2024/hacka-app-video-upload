import { UniqueEntityId } from '@core/domain/valueObjects/unique-entity-id'

describe('UniqueEntityId', () => {
    it('deve gerar um UUID automaticamente se não for passado valor', () => {
        const id = new UniqueEntityId()
        expect(typeof id.getValue()).toBe('string')
        expect(id.getValue()).toHaveLength(36)
    })

    it('deve aceitar um valor customizado', () => {
        const custom = 'meu-uuid-personalizado'
        const id = new UniqueEntityId(custom)
        expect(id.getValue()).toBe(custom)
    })

    it('getValue deve retornar o valor', () => {
        const id = new UniqueEntityId('ghi')
        expect(id.getValue()).toBe('ghi')
    })
})
