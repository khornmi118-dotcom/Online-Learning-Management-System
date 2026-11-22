import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/database.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import enrollmentRoutes from './routes/enrollmentRoutes.js'
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
app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))
app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api', dashboardRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

async function startServer() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`)
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters')
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
