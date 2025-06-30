import { User } from '@core/domain/entities/user'
import { UserPresenter } from '@adapter/driver/http/presenters/user-presenter'

describe('UserPresenter', () => {
    it('deve converter um domínio User em UserPresenter', () => {
        // Arrange
        const user = new User({
            id: 'user-123',
            nome: 'John Doe',
            email: 'john.doe@example.com'
        })

        // Act
        const presenter = UserPresenter.fromDomain(user)

        // Assert
        expect(presenter).toBeInstanceOf(UserPresenter)
        expect(presenter.id).toBe(user.id)
        expect(presenter.email).toBe(user.email)
    })

    it('deve omitir o campo nome na apresentação', () => {
        // Arrange
        const user = new User({
            id: 'user-123',
            nome: 'John Doe',
            email: 'john.doe@example.com'
        })

        // Act
        const presenter = UserPresenter.fromDomain(user)

        // Assert
        expect(presenter).not.toHaveProperty('nome')
        expect(Object.keys(presenter)).toEqual(['id', 'email'])
    })
})