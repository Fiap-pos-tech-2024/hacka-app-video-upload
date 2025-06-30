// filepath: c:\Users\Léo\www\Fiap\FASE 5\upload-video\tests\core\domain\exceptions\auth-exceptions.spec.ts
import { 
    UnauthorizedException, 
    ForbiddenException, 
    NoMappedAuthException 
} from '@core/domain/exceptions/auth-exceptions'

describe('Auth Exceptions', () => {
    describe('UnauthorizedException', () => {
        it('deve criar com mensagem padrão', () => {
            // Arrange & Act
            const exception = new UnauthorizedException()
            
            // Assert
            expect(exception).toBeInstanceOf(Error)
            expect(exception.name).toBe('UnauthorizedException')
            expect(exception.message).toBe('Unauthorized')
        })

        it('deve criar com mensagem personalizada', () => {
            // Arrange & Act
            const message = 'Token inválido'
            const exception = new UnauthorizedException(message)
            
            // Assert
            expect(exception.name).toBe('UnauthorizedException')
            expect(exception.message).toBe(message)
        })
    })

    describe('ForbiddenException', () => {
        it('deve criar com mensagem padrão', () => {
            // Arrange & Act
            const exception = new ForbiddenException()
            
            // Assert
            expect(exception).toBeInstanceOf(Error)
            expect(exception.name).toBe('ForbiddenException')
            expect(exception.message).toBe('Forbidden')
        })

        it('deve criar com mensagem personalizada', () => {
            // Arrange & Act
            const message = 'Acesso negado ao recurso'
            const exception = new ForbiddenException(message)
            
            // Assert
            expect(exception.name).toBe('ForbiddenException')
            expect(exception.message).toBe(message)
        })
    })

    describe('NoMappedAuthException', () => {
        it('deve criar com mensagem padrão', () => {
            // Arrange & Act
            const exception = new NoMappedAuthException()
            
            // Assert
            expect(exception).toBeInstanceOf(Error)
            expect(exception.name).toBe('NoMappedAuthException')
            expect(exception.message).toBe('No mapped auth exception')
        })

        it('deve criar com mensagem personalizada', () => {
            // Arrange & Act
            const message = 'Tipo de autenticação não mapeado'
            const exception = new NoMappedAuthException(message)
            
            // Assert
            expect(exception.name).toBe('NoMappedAuthException')
            expect(exception.message).toBe(message)
        })
    })
})