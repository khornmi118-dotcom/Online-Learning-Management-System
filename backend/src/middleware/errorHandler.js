import mongoose from 'mongoose'

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  let status = error.status || 500
  let message = status >= 500 ? 'Internal server error' : error.message

  if (error instanceof mongoose.Error.ValidationError) {
    status = 400
    message = 'Request validation failed.'
  } else if (error instanceof mongoose.Error.CastError) {
    status = 400
    message = 'Invalid resource identifier.'
  } else if (error.code === 11000) {
    status = 409
    message = 'A record with the same unique value already exists.'
  } else if (error.type === 'entity.parse.failed') {
    status = 400
    message = 'Invalid JSON request body.'
  }

  if (status >= 500) console.error(error)

  return res.status(status).json({
    success: false,
    message,
  })
}
