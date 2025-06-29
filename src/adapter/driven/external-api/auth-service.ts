import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { AuthPort } from '@core/application/ports/auth'
import { User } from '@core/domain/entities/user'
import { 
    ForbiddenException, 
    UnauthorizedException, 
    NoMappedAuthException 
} from '@core/domain/exceptions/auth-exceptions'

interface AuthResponse {
  user: {
    id: string;
    nome: string;
    email: string;
  };
  message: string;
}

export class AuthService implements AuthPort {
    private readonly baseUrl = process.env.BASE_PATH_AUTH
    private readonly apiClient: AxiosInstance
    
    constructor() {
        if (!this.baseUrl) {
            throw new Error('BASE_PATH_AUTH environment variable is not set')
        }

        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 5000
        })
    }

    async validateToken(token: string): Promise<User | null> {
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            
            const response = await this.apiClient.get<AuthResponse>('/validate', config)
            
            if (response.data) {
                const { user } = response.data
                return new User({ id: user.id, nome: user.nome, email: user.email })
            }
            
            return null
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError
                
                switch (axiosError.response?.status) {
                case 401:
                    throw new UnauthorizedException('Invalid or expired token')
                case 403:
                    throw new ForbiddenException('User does not have permission')
                default:
                    throw new NoMappedAuthException('An unexpected error occurred while validating the token')
                }
            }
            
            throw error
        }
    }
}
