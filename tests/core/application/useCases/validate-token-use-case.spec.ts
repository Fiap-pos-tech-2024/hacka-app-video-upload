import { User } from '@core/domain/entities/user'
import { UserPresenter } from '@adapter/driver/http/presenters/user-presenter'
import { UnauthorizedException } from '@core/domain/exceptions/auth-exceptions'
import { ValidateTokenUseCase } from '@core/application/useCases/validate-token-use-case'

describe('ValidateTokenUseCase', () => {
    let auth: { validateToken: jest.Mock }
    let useCase: ValidateTokenUseCase
    
    beforeEach(() => {
        auth = {
            validateToken: jest.fn()
        }
        
        useCase = new ValidateTokenUseCase(auth)
        jest.clearAllMocks()
    })
    
    it('deve validar o token e retornar um UserPresenter', async () => {
        // Arrange
        const mockUser = new User({
            id: 'user-123',
            nome: 'John Doe',
            email: 'john@example.com'
        })
        
        auth.validateToken.mockResolvedValue(mockUser)
        const authorization = 'Bearer valid-token'
        
        // Act
        const result = await useCase.execute({ authorization })
        
        // Assert
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
        expect(result).toBeInstanceOf(UserPresenter)
        expect(result.id).toBe(mockUser.id)
        expect(result.email).toBe(mockUser.email)
    })
    
    it('deve lançar UnauthorizedException quando authorization header estiver ausente', async () => {
        // Act & Assert
        await expect(useCase.execute({}))
            .rejects.toThrow(new UnauthorizedException('Authorization header is missing or invalid'))
        
        expect(auth.validateToken).not.toHaveBeenCalled()
    })
    
    it('deve lançar UnauthorizedException quando authorization não começar com "Bearer "', async () => {
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Token abc123' }))
            .rejects.toThrow(new UnauthorizedException('Authorization header is missing or invalid'))
        
        expect(auth.validateToken).not.toHaveBeenCalled()
    })
    
    it('deve lançar UnauthorizedException quando token estiver vazio após "Bearer "', async () => {
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer ' }))
            .rejects.toThrow(new UnauthorizedException('JWT token is missing'))
        
        expect(auth.validateToken).not.toHaveBeenCalled()
    })
    
    it('deve lançar UnauthorizedException quando validateToken retornar null', async () => {
        // Arrange
        auth.validateToken.mockResolvedValue(null)
        
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer valid-token' }))
            .rejects.toThrow(new UnauthorizedException('Invalid JWT token'))
        
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
    })
    
    it('deve lançar UnauthorizedException quando validateToken retornar usuário sem email', async () => {
        // Arrange
        auth.validateToken.mockResolvedValue({
            id: 'user-123',
            nome: 'John Doe'
            // email ausente
        })
        
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer valid-token' }))
            .rejects.toThrow(new UnauthorizedException('Invalid JWT token'))
        
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
    })
    
    it('deve lançar UnauthorizedException quando validateToken retornar usuário sem id', async () => {
        // Arrange
        auth.validateToken.mockResolvedValue({
            // id ausente
            nome: 'John Doe',
            email: 'john@example.com'
        })
        
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer valid-token' }))
            .rejects.toThrow(new UnauthorizedException('Invalid JWT token'))
        
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
    })
    
    it('deve lançar UnauthorizedException quando validateToken retornar usuário sem nome', async () => {
        // Arrange
        auth.validateToken.mockResolvedValue({
            id: 'user-123',
            // nome ausente
            email: 'john@example.com'
        })
        
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer valid-token' }))
            .rejects.toThrow(new UnauthorizedException('Invalid JWT token'))
        
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
    })
    
    it('deve propagar erros do serviço de autenticação', async () => {
        // Arrange
        const error = new Error('Authentication service error')
        auth.validateToken.mockRejectedValue(error)
        
        // Act & Assert
        await expect(useCase.execute({ authorization: 'Bearer valid-token' }))
            .rejects.toThrow(error)
        
        expect(auth.validateToken).toHaveBeenCalledWith('valid-token')
    })
})