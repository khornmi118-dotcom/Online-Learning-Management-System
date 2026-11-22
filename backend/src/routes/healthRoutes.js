import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

router.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: 'EduPlatform API is running!',
    status: databaseConnected ? 'OK' : 'DEGRADED',
    database: {
      connected: databaseConnected,
      status: connectionStates[mongoose.connection.readyState] ?? 'unknown',
    },
  })
})

export default router
