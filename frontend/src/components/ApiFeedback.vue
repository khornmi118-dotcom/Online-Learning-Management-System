<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'Nothing here yet' },
  emptyMessage: { type: String, default: '' },
})
</script>

<template>
  <div v-if="loading" class="feedback-card" role="status"><span class="spinner" aria-hidden="true"></span><span>Loading your information…</span></div>
  <div v-else-if="error" class="feedback-card feedback-error" role="alert">
    <span class="feedback-icon">!</span>
    <div><strong>We couldn’t load this right now</strong><p>{{ error }}</p><slot /></div>
  </div>
  <div v-else-if="empty" class="feedback-card feedback-empty">
    <span class="empty-sparkle" aria-hidden="true">✦</span><strong>{{ emptyTitle }}</strong><p>{{ emptyMessage }}</p><slot />
  </div>
</template>
