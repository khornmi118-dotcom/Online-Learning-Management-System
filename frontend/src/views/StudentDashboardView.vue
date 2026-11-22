<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ApiFeedback from '../components/ApiFeedback.vue'
import { errorMessage, getStudentDashboard, payloadOf } from '../services/api'
import { useAuthStore } from '../stores/auth'

const data = ref(null)
const loading = ref(true)
const error = ref('')
const { currentUser: user } = storeToRefs(useAuthStore())
const courses = computed(() => data.value?.enrolledCourses || data.value?.courses || [])

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try { data.value = payloadOf(await getStudentDashboard()) || {} }
  catch (cause) { error.value = errorMessage(cause) }
  finally { loading.value = false }
}
onMounted(loadDashboard)
</script>

<template>
  <section class="page-container page-section dashboard-page">
    <div class="dashboard-welcome"><div><p class="section-overline">Your learning space</p><h1>Good to see you<span v-if="user?.name">, {{ user.name.split(' ')[0] }}</span>.</h1><p>Every step counts. Let’s see where you’re headed.</p></div><RouterLink to="/courses" class="button button-primary">Explore courses <span>↗</span></RouterLink></div>
    <div v-if="!loading && !error" class="dashboard-stat-grid">
      <article><span class="dashboard-stat-icon stat-peach">↗</span><div><small>Courses in progress</small><b>{{ data?.stats?.inProgress ?? courses.length }}</b></div></article>
      <article><span class="dashboard-stat-icon stat-lilac">✳</span><div><small>Courses completed</small><b>{{ data?.stats?.completed ?? 0 }}</b></div></article>
      <article><span class="dashboard-stat-icon stat-mint">◷</span><div><small>Learning hours</small><b>{{ data?.stats?.learningHours ?? 0 }}</b></div></article>
    </div>
    <div id="learning" class="dashboard-section-heading"><div><p class="section-overline">Keep the momentum</p><h2>Your learning</h2></div><RouterLink to="/courses" class="text-link">Browse courses <span>→</span></RouterLink></div>
    <div v-if="!loading && !error && courses.length" class="learning-list-grid">
      <article v-for="item in courses" :key="item._id || item.id || item.course?._id" class="learning-card">
        <div class="learning-card-art"><span>✳</span></div><div class="learning-card-content"><p class="course-meta">{{ item.category || item.course?.category || 'Your course' }}</p><h3>{{ item.title || item.course?.title || 'Course' }}</h3><p>{{ item.instructor || item.course?.instructor || 'Keep learning at your pace' }}</p>
          <div class="progress-label"><span>Progress</span><b>{{ item.progress ?? 0 }}%</b></div><div class="progress-track"><span :style="{ width: `${Math.min(100, Math.max(0, Number(item.progress) || 0))}%` }"></span></div><RouterLink :to="`/courses/${item._id || item.id || item.course?._id}`" class="text-link">Continue learning <span>→</span></RouterLink>
        </div>
      </article>
    </div>
    <ApiFeedback :loading="loading" :error="error" :empty="!loading && !error && courses.length === 0" empty-title="Your learning journey starts here" empty-message="Explore the course catalog and find something you’re excited to learn.">
      <RouterLink to="/courses" class="button button-primary">Explore courses <span>→</span></RouterLink>
      <button v-if="error" type="button" class="button button-outline" @click="loadDashboard">Try again</button>
    </ApiFeedback>
  </section>
</template>
