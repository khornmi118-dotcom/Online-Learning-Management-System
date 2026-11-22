<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage } from '../services/api'
import { useAuthStore } from '../stores/auth'

const menuOpen = ref(false)
const authError = ref('')
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { currentUser, isAuthenticated } = storeToRefs(auth)

watch(currentUser, (user) => {
  if (user) authError.value = ''
})

onMounted(async () => {
  try {
    await auth.refreshCurrentUser()
  } catch (cause) {
    authError.value = errorMessage(cause)
  }
})

function isActive(path, hash = null) {
  const pathIsActive = route.path === path || route.path.startsWith(`${path}/`)
  return pathIsActive && (hash === null || route.hash === hash)
}

function logout() {
  auth.signOut()
  menuOpen.value = false
  router.push('/')
}
</script>

<template>
  <header class="site-header">
    <div class="page-container flex h-[76px] items-center justify-between gap-5">
      <RouterLink to="/" class="brand" aria-label="EduPlatform home" @click="menuOpen = false">
        <span class="brand-mark">e</span>
        <span>edu<span class="brand-accent">platform</span></span>
      </RouterLink>
      <button class="mobile-menu-button" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <nav class="main-nav" :class="{ 'is-open': menuOpen, 'admin-nav': currentUser?.role === 'admin' }" aria-label="Main navigation">
        <RouterLink v-if="!isAuthenticated || currentUser?.role === 'admin'" to="/" :class="{ active: route.path === '/' }" @click="menuOpen = false">Home</RouterLink>
        <RouterLink to="/courses" :class="{ active: isActive('/courses') }" @click="menuOpen = false">Explore courses</RouterLink>
        <template v-if="isAuthenticated && currentUser?.role === 'admin'">
          <RouterLink to="/admin#courses" :class="{ active: isActive('/admin', '#courses') }" @click="menuOpen = false">Manage Courses</RouterLink>
          <RouterLink to="/admin#students" :class="{ active: isActive('/admin', '#students') }" @click="menuOpen = false">Manage Students</RouterLink>
          <RouterLink to="/admin#enrollments" :class="{ active: isActive('/admin', '#enrollments') }" @click="menuOpen = false">Manage Enrollments</RouterLink>
          <RouterLink to="/admin" :class="{ active: isActive('/admin', '') }" @click="menuOpen = false">Admin Dashboard</RouterLink>
          <RouterLink to="/profile" :class="{ active: isActive('/profile', '') }" @click="menuOpen = false">Profile</RouterLink>
        </template>
        <template v-else-if="isAuthenticated && currentUser?.role === 'student'">
          <RouterLink to="/student#learning" :class="{ active: isActive('/student', '#learning') }" @click="menuOpen = false">My Learning</RouterLink>
          <RouterLink to="/profile" :class="{ active: isActive('/profile', '') }" @click="menuOpen = false">Profile</RouterLink>
        </template>
        <div class="nav-auth">
          <template v-if="isAuthenticated && currentUser">
            <span class="nav-user">{{ currentUser.name || currentUser.email }}</span>
            <button type="button" class="button button-outline button-small" @click="logout">Sign Out</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-login" @click="menuOpen = false">Log in</RouterLink>
          </template>
        </div>
        <span v-if="authError" class="nav-auth-error" role="alert">{{ authError }}</span>
      </nav>
    </div>
  </header>
</template>
