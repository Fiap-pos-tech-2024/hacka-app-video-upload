import { User } from '@core/domain/entities/user'

export interface AuthPort {
    validateToken(token: string): Promise<User | null>;
}
