<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { errorMessage, payloadOf, updateProfile } from '../services/api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
const form = ref({ name: '', email: '' })
const saving = ref(false)
const error = ref('')
const notice = ref('')

watch(currentUser, (user) => {
  if (user) {
    form.value = { name: user.name || '', email: user.email || '' }
  }
}, { immediate: true })

async function submitProfile() {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    const result = payloadOf(await updateProfile({
      name: form.value.name.trim(),
      email: form.value.email.trim(),
    }))
    if (!result?.user) throw new Error('The server did not return the updated profile.')
    auth.setCurrentUser(result.user)
    notice.value = 'Your profile has been saved.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="page-container page-section">
    <div class="profile-card">
      <p class="section-overline">Your account</p>
      <h1>Profile</h1>
      <p class="profile-description">Update the name and email address associated with your account.</p>
      <p class="profile-role">Account type: <b>{{ currentUser?.role }}</b></p>

      <form class="auth-form profile-form" @submit.prevent="submitProfile">
        <label class="form-field">
          <span>Name</span>
          <input v-model.trim="form.name" type="text" autocomplete="name" minlength="2" maxlength="100" required />
        </label>
        <label class="form-field">
          <span>Email address</span>
          <input v-model.trim="form.email" type="email" autocomplete="email" maxlength="254" required />
        </label>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <p v-if="notice" class="form-success" role="status">{{ notice }}</p>
        <button type="submit" class="button button-primary" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save profile' }}
        </button>
      </form>
    </div>
  </section>
</template>
