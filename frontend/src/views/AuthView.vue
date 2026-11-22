<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage } from '../services/api'

const props = defineProps({ mode: { type: String, default: 'login' } })
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const isRegister = computed(() => props.mode === 'register')
const isAdminLogin = computed(() => props.mode === 'admin-login')
const loading = ref(false)
const error = ref(typeof route.query.authError === 'string' ? route.query.authError : '')
const form = ref({ name: '', email: '', password: '' })

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const result = await auth.authenticate(props.mode, {
      ...(isRegister.value ? { name: form.value.name } : {}),
      email: form.value.email,
      password: form.value.password,
    })
    const role = result.user?.role
    const redirect = route.query.redirect
    if (isAdminLogin.value && role !== 'admin') {
      auth.signOut()
      error.value = 'Admin access requires an administrator account.'
      return
    }
    if (!isAdminLogin.value && props.mode === 'login' && role !== 'student') {
      auth.signOut()
      error.value = 'Use the Admin login page.'
      return
    }
    const destination = isAdminLogin.value
      ? '/admin'
      : role === 'student'
        ? (typeof redirect === 'string' && /^\/(student|profile|courses)(\/|$)/.test(redirect) ? redirect : '/student')
        : '/'
    await router.push(destination)
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-art"><div class="auth-art-inner"><span class="auth-art-symbol">e.</span><p class="section-overline">A little room to grow</p><h2>Learning is a<br />way forward.</h2><p>Bring your curiosity. We’ll meet you there.</p><div class="auth-decoration"><span>✳</span><i></i><b></b></div></div></div>
    <div class="auth-panel"><div class="auth-form-wrap">
      <p class="section-overline">{{ isRegister ? 'Your next chapter' : isAdminLogin ? 'Administration' : 'Welcome back' }}</p><h1>{{ isRegister ? 'Create your account.' : isAdminLogin ? 'Admin sign in.' : 'Good to have you back.' }}</h1><p class="auth-subtitle">{{ isRegister ? 'Sign up to discover learning that fits you.' : isAdminLogin ? 'Sign in with an administrator account.' : 'Log in to pick up where you left off.' }}</p>
      <form class="auth-form" @submit.prevent="submit">
        <label v-if="isRegister" class="form-field"><span>Your name</span><input v-model.trim="form.name" type="text" autocomplete="name" placeholder="Jamie Parker" required /></label>
        <label class="form-field"><span>Email address</span><input v-model.trim="form.email" type="email" autocomplete="email" placeholder="you@example.com" required /></label>
        <label class="form-field"><span>Password</span><input v-model="form.password" type="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" placeholder="At least 8 characters" :minlength="isRegister ? 8 : undefined" required /></label>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <button type="submit" class="button button-primary button-full auth-submit" :disabled="loading">{{ loading ? 'Please wait…' : isRegister ? 'Create account' : 'Log in' }} <span v-if="!loading">→</span></button>
      </form>
      <p class="auth-switch">{{ isRegister ? 'Already learning with us?' : 'New to EduPlatform?' }} <RouterLink :to="isRegister ? '/login' : '/register'">{{ isRegister ? 'Log in' : 'Create an account' }}</RouterLink></p>
      <p class="auth-security">Your details stay private and secure.</p>
    </div></div>
  </section>
</template>
