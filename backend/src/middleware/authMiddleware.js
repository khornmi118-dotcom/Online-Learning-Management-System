import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function unauthorized(res) {
  return res.status(401).json({ success: false, message: 'Authentication is required.' })
}

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || ''
  const parts = authorization.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) return unauthorized(res)

  let payload
  try {
    payload = jwt.verify(parts[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'eduplatform',
    })
  } catch {
    return unauthorized(res)
  }

  if (!payload.sub) return unauthorized(res)
  const user = await User.findById(payload.sub)
  if (!user) return unauthorized(res)

  req.user = user
  return next()
}

export function requireRole(...roles) {
  return function roleAuthorization(req, res, next) {
    if (!req.user) return unauthorized(res)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' })
    }
    return next()
  }
}
