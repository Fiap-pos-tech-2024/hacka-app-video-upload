export class User {
    readonly id: string
    readonly nome: string
    readonly email: string

    constructor({ id, nome, email }: { id: string, nome: string, email: string }) {
        this.id = id
        this.nome = nome
        this.email = email
    }
}