import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  authenticate as sendCredentials,
  getCurrentUser,
  hasAuthToken,
  payloadOf,
  signOut as clearSession,
} from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = ref(false)
  let sessionVersion = 0
  let refreshRequest = null
  let hasFreshLogin = false

  async function refreshCurrentUser() {
    if (!hasAuthToken()) {
      hasFreshLogin = false
      currentUser.value = null
      isAuthenticated.value = false
      return null
    }

    if (hasFreshLogin && currentUser.value) {
      hasFreshLogin = false
      return currentUser.value
    }

    const version = sessionVersion
    if (refreshRequest?.version === version) return refreshRequest.promise

    let request
    request = (async () => {
      try {
        const result = payloadOf(await getCurrentUser())
        if (version !== sessionVersion || !hasAuthToken()) return currentUser.value
        if (!result?.user) {
          throw new Error('The server response did not include the authenticated user.')
        }
        currentUser.value = result.user
        isAuthenticated.value = true
        return result.user
      } catch (error) {
        if (version !== sessionVersion) return currentUser.value
        hasFreshLogin = false
        currentUser.value = null
        isAuthenticated.value = false
        if (error.response?.status === 401) {
          sessionVersion += 1
          clearSession()
          return null
        }
        throw error
      } finally {
        if (refreshRequest?.promise === request) refreshRequest = null
      }
    })()

    refreshRequest = { version, promise: request }
    return request
  }

  async function authenticate(mode, credentials) {
    sessionVersion += 1
    refreshRequest = null
    hasFreshLogin = false
    currentUser.value = null

    const result = await sendCredentials(mode, credentials)
    if (!result.user || !['student', 'admin'].includes(result.user.role)) {
      clearSession()
      throw new Error('The authentication response did not include the authenticated user and role.')
    }

    currentUser.value = result.user
    isAuthenticated.value = true
    hasFreshLogin = true
    return result
  }

  function setCurrentUser(user) {
    currentUser.value = user
    isAuthenticated.value = Boolean(user)
  }

  function signOut() {
    sessionVersion += 1
    refreshRequest = null
    hasFreshLogin = false
    currentUser.value = null
    isAuthenticated.value = false
    clearSession()
  }

  return {
    currentUser,
    isAuthenticated,
    authenticate,
    refreshCurrentUser,
    setCurrentUser,
    signOut,
  }
})
