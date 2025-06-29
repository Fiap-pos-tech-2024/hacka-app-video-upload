export class UnauthorizedException extends Error {
    constructor(message = 'Unauthorized') {
        super(message)
        this.name = 'UnauthorizedException'
    }
}

export class ForbiddenException extends Error {
    constructor(message = 'Forbidden') {
        super(message)
        this.name = 'ForbiddenException'
    }
}

export class NoMappedAuthException extends Error {
    constructor(message = 'No mapped auth exception') {
        super(message)
        this.name = 'NoMappedAuthException'
    }
}
