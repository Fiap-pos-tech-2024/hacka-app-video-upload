import { Request, Response, NextFunction } from 'express'
import { container } from '@ioc/container'

// Stryker disable all
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      authorization: string;
    }
  }
}

export default async function validateToken(
    request: Request,
    _response: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = request.headers.authorization   

        const user = await container.validateTokenUseCase.execute({ authorization: authHeader })

        request.user = {
            id: String(user.id),
            email: user.email,
            authorization: authHeader!
        }

        return next()
    } catch (error) {
        return next(error)
    }
}
