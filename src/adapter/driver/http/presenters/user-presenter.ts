import { User } from '@core/domain/entities/user'

export class UserPresenter {
    readonly id: string
    readonly email: string

    private constructor(id: string, email: string) {
        this.id = id
        this.email = email
    }

    static fromDomain(user: User) {
        return new UserPresenter(
            user.id,
            user.email
        )
    }
}
