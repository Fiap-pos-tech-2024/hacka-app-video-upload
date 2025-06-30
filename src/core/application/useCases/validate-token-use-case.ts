import { AuthPort } from '../ports/auth'
import { UnauthorizedException } from '@core/domain/exceptions/auth-exceptions'
import { UserPresenter } from '@adapter/driver/http/presenters/user-presenter'

interface ValidateTokenUseCaseDto {
  authorization?: string;
}

export class ValidateTokenUseCase {
    constructor(
        private readonly auth: AuthPort,
    ) {}

    async execute({ authorization }: ValidateTokenUseCaseDto): Promise<UserPresenter> {
        if (!authorization?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization header is missing or invalid')
        }

        const [, token] = authorization.split(' ')
        if (!token) {
            throw new UnauthorizedException('JWT token is missing')
        }

        const authUser = await this.auth.validateToken(token)
        if (!authUser?.email || !authUser?.id || !authUser?.nome) {
            throw new UnauthorizedException('Invalid JWT token')
        }

        return UserPresenter.fromDomain(authUser)
    }
}