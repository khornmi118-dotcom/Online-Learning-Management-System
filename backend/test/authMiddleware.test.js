import assert from 'node:assert/strict'
import test from 'node:test'
import { requireRole } from '../src/middleware/authMiddleware.js'

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('student receives 403 for an admin-only route', () => {
  const response = createResponse()
  let nextCalled = false

  requireRole('admin')(
    { user: { role: 'student' } },
    response,
    () => { nextCalled = true },
  )

  assert.equal(response.statusCode, 403)
  assert.equal(response.body.success, false)
  assert.equal(nextCalled, false)
})

test('students and admins can access routes allowing both roles', () => {
  for (const role of ['student', 'admin']) {
    const response = createResponse()
    let nextCalled = false

    requireRole('student', 'admin')(
      { user: { role } },
      response,
      () => { nextCalled = true },
    )

    assert.equal(response.statusCode, 200)
    assert.equal(nextCalled, true)
  }
})
