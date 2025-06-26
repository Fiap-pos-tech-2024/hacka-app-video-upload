import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './docs/swagger.json'
import videoRouter from './routes/video.routes'
import globalErrorHandler from './global-error-handling'

// Stryker disable all
export class HackaAPI {
    static start() {
        const app = express()
        
        app.use(express.json())
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

        app.use(express.urlencoded({ extended: true }))
        app.use('/video', videoRouter)
        app.use(globalErrorHandler)

        const port = process.env.PORT ?? 3001

        app.listen(port, () => {
            console.log(`Server started on port ${port}⚡`)
        })
    }
}
