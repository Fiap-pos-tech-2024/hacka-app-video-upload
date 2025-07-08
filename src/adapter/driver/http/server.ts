import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './docs/swagger.json'
import videoRouter from './routes/video.routes'
import globalErrorHandler from './global-error-handling'
import { metricsMiddleware, register } from '../../../config/prometheus'

// Stryker disable all
export class HackaAPI {
  static start() {
    const app = express()

    app.use(express.json())
    app.use(metricsMiddleware) // 

    app.use('/video-upload-app/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    app.use(express.urlencoded({ extended: true }))
    app.use('/video-upload-app/video', videoRouter)

    app.get('/upload-metrics', async (_req, res) => {
      try {
        res.set('Content-Type', register.contentType)
        res.end(await register.metrics())
      } catch (err) {
        res.status(500).end((err as Error).message)
      }
    })

    app.use('/health', (_req, res) => {
      res.status(200).json({ status: 'UP' })
    })

    app.use(globalErrorHandler)

    const port = process.env.PORT ?? 3001
    app.listen(port, () => {
      console.log(`Server started on port ${port} ⚡`)
      console.log(`Metrics available at /upload-metrics`)
    })
  }
}
