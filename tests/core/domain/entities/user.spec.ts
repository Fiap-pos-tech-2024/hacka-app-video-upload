import { User } from '@core/domain/entities/user'

describe('User', () => {
    it('deve criar um usuário com os atributos corretos', () => {
        // Arrange
        const userData = {
            id: 'user-123',
            nome: 'John Doe',
            email: 'john.doe@example.com'
        }

        // Act
        const user = new User(userData)

        // Assert
        expect(user.id).toBe(userData.id)
        expect(user.nome).toBe(userData.nome)
        expect(user.email).toBe(userData.email)
    })
})