<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import ApiFeedback from '../components/ApiFeedback.vue'
import {
  createEnrollment,
  errorMessage,
  getCourse,
  getMyCourses,
  payloadOf,
} from '../services/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const { currentUser } = storeToRefs(useAuthStore())
const course = ref(null)
const loading = ref(true)
const error = ref('')
const enrollmentError = ref('')
const enrollmentLoading = ref(false)
const enrolled = ref(false)

async function loadCourse() {
  loading.value = true
  error.value = ''
  try {
    const result = payloadOf(await getCourse(props.id))
    course.value = result?.course || result
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    loading.value = false
  }
}
onMounted(loadCourse)
watch(() => props.id, loadCourse)

watch([currentUser, () => course.value?._id], async ([user, courseId]) => {
  enrolled.value = false
  enrollmentError.value = ''
  if (!user || !courseId) return

  try {
    const result = payloadOf(await getMyCourses())
    const courses = result?.enrolledCourses || []
    enrolled.value = courses.some((item) => String(item._id) === String(courseId))
  } catch (cause) {
    enrollmentError.value = errorMessage(cause)
  }
}, { immediate: true })

async function enroll() {
  if (!course.value) return
  enrollmentLoading.value = true
  enrollmentError.value = ''
  try {
    await createEnrollment(course.value._id)
    enrolled.value = true
  } catch (cause) {
    enrollmentError.value = errorMessage(cause)
  } finally {
    enrollmentLoading.value = false
  }
}
</script>

<template>
  <section class="page-container page-section">
    <RouterLink to="/courses" class="back-link">← Back to courses</RouterLink>
    <ApiFeedback :loading="loading" :error="error" :empty="!loading && !error && !course" empty-title="Course not found" empty-message="This course may have been removed or the link may be incorrect.">
      <button v-if="error" type="button" class="button button-outline" @click="loadCourse">Try again</button>
      <button v-if="!loading && !error && !course" type="button" class="button button-primary" @click="router.push('/courses')">Browse courses</button>
    </ApiFeedback>
    <div v-if="course" class="course-detail">
      <div class="detail-cover" :class="`cover-${(course.title?.length || 0) % 4}`"><span class="cover-label">{{ course.category || 'Course' }}</span><span class="detail-cover-mark">✳</span></div>
      <div class="detail-content"><div class="detail-main">
        <p class="section-overline">{{ course.level || 'All levels' }} <span>·</span> {{ course.duration || 'Self-paced' }}</p><h1>{{ course.title }}</h1><p class="detail-description">{{ course.description || 'Explore this course and discover the skills you can build along the way.' }}</p>
        <div class="detail-instructor"><span class="instructor-avatar">{{ (course.instructor || course.instructorName || 'E').slice(0, 1) }}</span><span><small>YOUR INSTRUCTOR</small><b>{{ course.instructor || course.instructorName || 'EduPlatform instructor' }}</b></span></div>
        <h2>What you’ll learn</h2><ul class="learning-list"><li v-for="(item, index) in course.learningOutcomes || course.outcomes || ['Build practical knowledge you can put to work', 'Learn at a pace that feels right for you', 'Create a foundation for your next step']" :key="index"><span>✓</span>{{ typeof item === 'string' ? item : item.title }}</li></ul>
      </div><aside class="enroll-card"><div class="enroll-price">{{ course.price ? `$${course.price}` : 'Start learning' }}</div><p>Learn on your schedule, with access to course materials and progress tracking.</p>
        <p v-if="enrollmentError" class="form-error" role="alert">{{ enrollmentError }}</p>
        <RouterLink v-if="!currentUser" to="/register" class="button button-primary button-full">Get started <span>→</span></RouterLink>
        <RouterLink v-else-if="enrolled" to="/student" class="button button-primary button-full">Continue learning <span>→</span></RouterLink>
        <button v-else type="button" class="button button-primary button-full" :disabled="enrollmentLoading" @click="enroll">
          {{ enrollmentLoading ? 'Enrolling…' : 'Enroll in this course' }}
        </button>
        <span class="enroll-note">No pressure. Just progress.</span>
      </aside></div>
    </div>
  </section>
</template>
