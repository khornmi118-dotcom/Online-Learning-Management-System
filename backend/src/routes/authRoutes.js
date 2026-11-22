import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { validateLogin, validateProfileUpdate, validateRegistration } from '../utils/validation.js'

const router = Router()
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
})

function createToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    issuer: 'eduplatform',
    expiresIn: '1d',
  })
}

router.post('/register', async (req, res) => {
  const values = validateRegistration(req.body)
  const user = await User.create({ ...values, role: 'student' })

  res.status(201).json({
    success: true,
    data: {
      token: createToken(user),
      user: publicUser(user),
    },
  })
})

router.post('/admin/login', async (req, res) => {
  const { email, password } = validateLogin(req.body)
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access requires an administrator account.' })
  }

  return res.status(200).json({
    success: true,
    data: {
      token: createToken(user),
      user: publicUser(user),
    },
  })
})

router.post('/login', async (req, res) => {
  const { email, password } = validateLogin(req.body)
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  }
  if (user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Use the Admin login page.' })
  }

  return res.status(200).json({
    success: true,
    data: {
      token: createToken(user),
      user: publicUser(user),
    },
  })
})

router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ success: true, data: { user: publicUser(req.user) } })
})

router.patch('/me', requireAuth, async (req, res) => {
  const values = validateProfileUpdate(req.body)
  Object.assign(req.user, values)
  await req.user.save()
  res.status(200).json({ success: true, data: { user: publicUser(req.user) } })
})

export default router
