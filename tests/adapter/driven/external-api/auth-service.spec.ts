import axios from 'axios'
import { AuthService } from '@adapter/driven/external-api/auth-service'
import { User } from '@core/domain/entities/user'
import { 
    ForbiddenException, 
    UnauthorizedException, 
    NoMappedAuthException 
} from '@core/domain/exceptions/auth-exceptions'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('AuthService', () => {
    let authService: AuthService
    const originalEnv = process.env
    const mockBaseUrl = 'https://auth-api.example.com'
    const mockToken = 'valid-token-123'
    
    // Mock axios instance that will be returned by axios.create
    const mockAxiosInstance = {
        get: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        process.env = { ...originalEnv, BASE_PATH_AUTH: mockBaseUrl }
        
        // Mock axios.create to return a mocked instance
        mockedAxios.create.mockReturnValue(mockAxiosInstance as any)
    })

    afterEach(() => {
        process.env = originalEnv
    })

    it('deve criar instância corretamente com BASE_PATH_AUTH definido', () => {
        // Act
        authService = new AuthService()
        
        // Assert
        expect(mockedAxios.create).toHaveBeenCalledWith({
            baseURL: mockBaseUrl,
            timeout: 5000
        })
    })

    describe('validateToken', () => {
        it('deve validar token com sucesso e retornar usuário', async () => {
            // Arrange
            const mockUser = {
                id: 'user-123',
                nome: 'John Doe',
                email: 'john@example.com'
            }
            
            const mockResponse = {
                data: {
                    user: mockUser,
                    message: 'Token validated successfully'
                }
            }
            
            mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act
            const result = await authService.validateToken(mockToken)
            
            // Assert
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/validate', {
                headers: {
                    Authorization: `Bearer ${mockToken}`
                }
            })
            
            expect(result).toBeInstanceOf(User)
            expect(result?.id).toBe(mockUser.id)
            expect(result?.nome).toBe(mockUser.nome)
            expect(result?.email).toBe(mockUser.email)
        })

        it('deve retornar null quando response.data não existir', async () => {
            // Arrange
            const mockResponse = { data: null }
            
            mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act
            const result = await authService.validateToken(mockToken)
            
            // Assert
            expect(result).toBeNull()
        })

        it('deve lançar UnauthorizedException para erro 401', async () => {
            // Arrange
            const mockError = {
                isAxiosError: true,
                response: { status: 401 }
            }
            
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act & Assert
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow(UnauthorizedException)
            
            // Need to create a new instance and mock again for the second test
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            authService = new AuthService()
            
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow('Invalid or expired token')
        })

        it('deve lançar ForbiddenException para erro 403', async () => {
            // Arrange
            const mockError = {
                isAxiosError: true,
                response: { status: 403 }
            }
            
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act & Assert
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow(ForbiddenException)
            
            // Need to create a new instance and mock again for the second test
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            authService = new AuthService()
            
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow('User does not have permission')
        })

        it('deve lançar NoMappedAuthException para outros códigos de erro HTTP', async () => {
            // Arrange
            const mockError = {
                isAxiosError: true,
                response: { status: 500 }
            }
            
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act & Assert
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow(NoMappedAuthException)
            
            // Need to create a new instance and mock again for the second test
            mockAxiosInstance.get.mockRejectedValueOnce(mockError)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)
            authService = new AuthService()
            
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow('An unexpected error occurred while validating the token')
        })

        it('deve propagar erros não relacionados ao Axios', async () => {
            // Arrange
            const networkError = new Error('Network error')
            
            mockAxiosInstance.get.mockRejectedValueOnce(networkError)
            mockedAxios.isAxiosError.mockReturnValueOnce(false)
            
            // Create authService instance
            authService = new AuthService()
            
            // Act & Assert
            await expect(authService.validateToken(mockToken))
                .rejects.toThrow(networkError)
        })
    })
})
