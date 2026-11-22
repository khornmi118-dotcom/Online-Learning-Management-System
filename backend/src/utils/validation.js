import { HttpError } from '../middleware/HttpError.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function requireObjectBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'A JSON object is required.')
  }
}

export function rejectUnknownFields(body, allowedFields) {
  const unexpected = Object.keys(body).find((field) => !allowedFields.includes(field))
  if (unexpected) throw new HttpError(400, `Unknown field: ${unexpected}`)
}

export function validateRegistration(body) {
  requireObjectBody(body)
  rejectUnknownFields(body, ['name', 'email', 'password'])

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = body.password

  if (name.length < 2 || name.length > 100) {
    throw new HttpError(400, 'Name must be between 2 and 100 characters.')
  }
  if (email.length > 254 || !emailPattern.test(email)) {
    throw new HttpError(400, 'A valid email address is required.')
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Password must be at least 8 characters and no more than 72 bytes.')
  }

  return { name, email, password }
}

export function validateLogin(body) {
  requireObjectBody(body)
  rejectUnknownFields(body, ['email', 'password'])

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (email.length > 254 || !emailPattern.test(email) || typeof body.password !== 'string' || body.password.length === 0) {
    throw new HttpError(400, 'A valid email and password are required.')
  }

  return { email, password: body.password }
}

export function validateProfileUpdate(body) {
  requireObjectBody(body)
  rejectUnknownFields(body, ['name', 'email'])
  if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'At least one profile field must be provided.')
  }

  const result = {}
  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2 || name.length > 100) {
      throw new HttpError(400, 'Name must be between 2 and 100 characters.')
    }
    result.name = name
  }
  if ('email' in body) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (email.length > 254 || !emailPattern.test(email)) {
      throw new HttpError(400, 'A valid email address is required.')
    }
    result.email = email
  }

  return result
}

export function validateCourseInput(body, { partial = false } = {}) {
  requireObjectBody(body)
  const fields = ['title', 'description', 'instructor', 'category', 'level', 'duration', 'price', 'learningOutcomes', 'status']
  rejectUnknownFields(body, fields)

  if (partial && Object.keys(body).length === 0) {
    throw new HttpError(400, 'At least one course field must be provided.')
  }

  const result = {}
  const textFields = {
    title: { max: 160, required: !partial },
    description: { max: 12000, required: !partial },
    instructor: { max: 120, required: false },
    category: { max: 80, required: !partial },
    level: { max: 40, required: false },
    duration: { max: 80, required: false },
  }

  for (const [field, rules] of Object.entries(textFields)) {
    if (!(field in body)) {
      if (rules.required) throw new HttpError(400, `${field} is required.`)
      continue
    }

    if (typeof body[field] !== 'string') throw new HttpError(400, `${field} must be a string.`)
    const value = body[field].trim()
    if ((rules.required && value.length === 0) || value.length > rules.max) {
      throw new HttpError(400, `${field} must be ${rules.required ? 'non-empty and ' : ''}at most ${rules.max} characters.`)
    }
    result[field] = value
  }

  if ('price' in body) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
      throw new HttpError(400, 'price must be a non-negative number.')
    }
    result.price = body.price
  }

  if ('learningOutcomes' in body) {
    if (!Array.isArray(body.learningOutcomes) || body.learningOutcomes.length > 30) {
      throw new HttpError(400, 'learningOutcomes must be an array of at most 30 items.')
    }
    result.learningOutcomes = body.learningOutcomes.map((item) => {
      if (typeof item !== 'string' || item.trim().length === 0 || item.trim().length > 500) {
        throw new HttpError(400, 'Each learning outcome must be a non-empty string of at most 500 characters.')
      }
      return item.trim()
    })
  }

  if ('status' in body) {
    if (!['draft', 'published'].includes(body.status)) {
      throw new HttpError(400, 'status must be either draft or published.')
    }
    result.status = body.status
  }

  return result
}

export function requireObjectId(value, label = 'id') {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw new HttpError(400, `Invalid ${label}.`)
  }
  return value
}
