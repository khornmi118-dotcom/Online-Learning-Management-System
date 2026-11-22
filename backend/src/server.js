import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/database.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import healthRoutes from './routes/healthRoutes.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin))
  },
}))
app.use(express.json())
app.use('/api', healthRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

async function startServer() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`)
  }

  await connectDatabase()

  app.listen(port, '0.0.0.0', () => {
    console.log(`EduPlatform API listening on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start EduPlatform API:', error)
  process.exitCode = 1
})
