import assert from 'node:assert/strict'
import test from 'node:test'
import { HttpError } from '../src/middleware/HttpError.js'
import {
  requireObjectId,
  validateCourseInput,
  validateLogin,
  validateProfileUpdate,
  validateRegistration,
} from '../src/utils/validation.js'

test('registration normalizes email and rejects public role assignment', () => {
  assert.deepEqual(
    validateRegistration({ name: ' Ada Lovelace ', email: ' ADA@EXAMPLE.COM ', password: 'secure-pass-123' }),
    { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secure-pass-123' },
  )

  assert.throws(
    () => validateRegistration({ name: 'Student', email: 'student@example.com', password: 'secure-pass-123', role: 'admin' }),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('registration rejects invalid emails and bcrypt-overlong passwords', () => {
  assert.throws(
    () => validateRegistration({ name: 'Student', email: 'not-an-email', password: 'secure-pass-123' }),
    (error) => error instanceof HttpError && error.status === 400,
  )
  assert.throws(
    () => validateRegistration({ name: 'Student', email: 'student@example.com', password: 'a'.repeat(73) }),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('login accepts only email and password', () => {
  assert.deepEqual(
    validateLogin({ email: ' STUDENT@example.com ', password: 'secret' }),
    { email: 'student@example.com', password: 'secret' },
  )
  assert.throws(
    () => validateLogin({ email: 'student@example.com', password: 'secret', role: 'admin' }),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('profile updates normalize editable fields and reject role changes', () => {
  assert.deepEqual(
    validateProfileUpdate({ name: ' Ada Lovelace ', email: ' ADA@EXAMPLE.COM ' }),
    { name: 'Ada Lovelace', email: 'ada@example.com' },
  )
  assert.throws(
    () => validateProfileUpdate({ role: 'admin' }),
    (error) => error instanceof HttpError && error.status === 400,
  )
  assert.throws(
    () => validateProfileUpdate({}),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('course validation requires core fields and rejects invalid price/status', () => {
  assert.deepEqual(
    validateCourseInput({ title: 'Vue Basics', description: 'Learn Vue', category: 'Development', price: 0 }),
    { title: 'Vue Basics', description: 'Learn Vue', category: 'Development', price: 0 },
  )
  assert.throws(
    () => validateCourseInput({ title: 'Vue Basics', description: 'Learn Vue', category: 'Development', price: -1 }),
    (error) => error instanceof HttpError && error.status === 400,
  )
  assert.throws(
    () => validateCourseInput({ status: 'removed' }, { partial: true }),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('partial course updates cannot be empty and identifiers must be ObjectId hex strings', () => {
  assert.throws(
    () => validateCourseInput({}, { partial: true }),
    (error) => error instanceof HttpError && error.status === 400,
  )
  assert.equal(requireObjectId('64b64c3f4f9d2a7b12345678'), '64b64c3f4f9d2a7b12345678')
  assert.throws(
    () => requireObjectId('not-an-id', 'course id'),
    (error) => error instanceof HttpError && error.status === 400,
  )
})

test('course status accepts only draft or published', () => {
  assert.deepEqual(
    validateCourseInput({ status: 'draft' }, { partial: true }),
    { status: 'draft' },
  )
  assert.deepEqual(
    validateCourseInput({ status: 'published' }, { partial: true }),
    { status: 'published' },
  )
  assert.throws(
    () => validateCourseInput({ status: 'archived' }, { partial: true }),
    (error) => error instanceof HttpError && error.status === 400,
  )
})
