import axios from 'axios'

const TOKEN_KEY = 'eduplatform_token'
const LEGACY_USER_KEY = 'eduplatform_user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function errorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (!error.response) {
    if (error.message === 'Network Error') return 'Unable to reach the EduPlatform server. Check your connection and try again.'
    return error.message || 'Unable to reach the EduPlatform server. Check your connection and try again.'
  }
  return `Request failed (${error.response.status}). Please try again.`
}

export function payloadOf(response) {
  const body = response.data
  return body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body
}

export function getCourses() {
  return api.get('/courses')
}

export function getAdminCourses() {
  return api.get('/courses/manage')
}

export function createCourse(course) {
  return api.post('/courses', course)
}

export function updateCourse(id, course) {
  return api.put(`/courses/${encodeURIComponent(id)}`, course)
}

export function publishCourse(id) {
  return api.patch(`/courses/${encodeURIComponent(id)}/publish`)
}

export function unpublishCourse(id) {
  return api.patch(`/courses/${encodeURIComponent(id)}/unpublish`)
}

export function deleteCourse(id) {
  return api.delete(`/courses/${encodeURIComponent(id)}`)
}

export function getCourse(id) {
  return api.get(`/courses/${encodeURIComponent(id)}`)
}

export function getStudentDashboard() {
  return api.get('/student/dashboard')
}

export function getMyCourses() {
  return api.get('/enrollments/my-courses')
}

export function createEnrollment(courseId) {
  return api.post(`/enrollments/${encodeURIComponent(courseId)}`)
}

export function getAdminDashboard() {
  return api.get('/admin/dashboard')
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function getAdminStudents() {
  return api.get('/admin/students')
}

export function getAdminEnrollments() {
  return api.get('/admin/enrollments')
}

export function getCurrentUser() {
  return api.get('/auth/me')
}

export function updateProfile(profile) {
  return api.patch('/auth/me', profile)
}

export async function authenticate(mode, credentials) {
  const endpoint = mode === 'admin-login' ? '/auth/admin/login' : `/auth/${mode}`
  const response = await api.post(endpoint, credentials)
  const result = payloadOf(response) || {}
  const token = result.token || result.accessToken
  if (!token) throw new Error('The server response did not include an authentication token.')
  localStorage.setItem(TOKEN_KEY, token)
  return result
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}
