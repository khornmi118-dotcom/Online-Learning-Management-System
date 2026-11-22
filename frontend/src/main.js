import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()
const app = createApp(App).use(pinia).use(router)
const auth = useAuthStore(pinia)

auth.refreshCurrentUser()
  .catch(() => {})
  .finally(() => app.mount('#app'))
