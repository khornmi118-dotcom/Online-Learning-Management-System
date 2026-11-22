import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AuthView from '../views/AuthView.vue'
import CourseDetailView from '../views/CourseDetailView.vue'
import CoursesView from '../views/CoursesView.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import StudentDashboardView from '../views/StudentDashboardView.vue'
import { errorMessage } from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to) => to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/courses', name: 'courses', component: CoursesView },
    { path: '/courses/:id', name: 'course-details', component: CourseDetailView, props: true },
    { path: '/login', name: 'login', component: AuthView, props: { mode: 'login' } },
    { path: '/admin/login', name: 'admin-login', component: AuthView, props: { mode: 'admin-login' } },
    { path: '/register', name: 'register', component: AuthView, props: { mode: 'register' } },
    { path: '/student', name: 'student-dashboard', component: StudentDashboardView, meta: { requiresAuth: true, requiredRole: 'student' } },
    { path: '/admin', name: 'admin-dashboard', component: AdminDashboardView, meta: { requiresAuth: true, requiredRole: 'admin' } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) return true

  let user
  try {
    user = await useAuthStore().refreshCurrentUser()
  } catch (cause) {
    return {
      name: 'login',
      query: { authError: errorMessage(cause), redirect: to.fullPath },
    }
  }

  if (!user) {
    if (to.meta.requiredRole === 'admin') {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
    if (user.role === 'student') return { name: 'student-dashboard' }
    if (user.role === 'admin') return { name: 'admin-dashboard' }
    return { name: 'home' }
  }
  return true
})

export default router
