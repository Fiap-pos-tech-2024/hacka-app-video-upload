import express from 'express';
import videoRouter from './routes/video.routes';
import globalErrorHandler from './global-error-handling';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/video', videoRouter);
app.use(globalErrorHandler)

const port = process.env.PORT ?? 3001

app.listen(port, () => {
    console.log(`Server started on port ${port}⚡`)
})
