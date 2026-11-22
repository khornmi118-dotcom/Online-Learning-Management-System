<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ApiFeedback from '../components/ApiFeedback.vue'
import { errorMessage, getCourses, payloadOf } from '../services/api'

const courses = ref([])
const loading = ref(true)
const error = ref('')
const query = ref('')
const category = ref('All')
const categories = computed(() => ['All', ...new Set(courses.value.map((course) => course.category).filter(Boolean))])
const filteredCourses = computed(() => courses.value.filter((course) => {
  const matchesCategory = category.value === 'All' || course.category === category.value
  const searchable = `${course.title || ''} ${course.instructor || course.instructorName || ''} ${course.category || ''}`.toLowerCase()
  return matchesCategory && searchable.includes(query.value.trim().toLowerCase())
}))

async function loadCourses() {
  loading.value = true
  error.value = ''
  try {
    const result = payloadOf(await getCourses())
    courses.value = Array.isArray(result) ? result : result?.courses || []
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    loading.value = false
  }
}
onMounted(loadCourses)
</script>

<template>
  <section class="page-container page-section">
    <div class="page-intro"><p class="section-overline">A good place to begin</p><h1>Find a course that<br /><span>moves you forward.</span></h1><p>Follow your curiosity. Pick up a practical skill. See where it takes you.</p></div>
    <div class="catalog-toolbar">
      <label class="search-field"><span aria-hidden="true">⌕</span><input v-model="query" type="search" placeholder="Search courses or instructors" aria-label="Search courses or instructors" /></label>
      <div class="category-list" aria-label="Course categories"><button v-for="item in categories" :key="item" type="button" class="category-chip" :class="{ selected: category === item }" @click="category = item">{{ item }}</button></div>
    </div>
    <div v-if="!loading && !error && filteredCourses.length" class="course-grid">
      <article v-for="(course, index) in filteredCourses" :key="course._id || course.id" class="course-card">
        <div class="course-cover" :class="`cover-${index % 4}`"><span class="cover-label">{{ course.category || 'Course' }}</span><span class="cover-mark" aria-hidden="true">{{ ['✳', '◉', '⌘', '↗'][index % 4] }}</span></div>
        <div class="course-card-body"><p class="course-meta">{{ course.level || 'All levels' }} <span>·</span> {{ course.duration || 'Self-paced' }}</p><h2>{{ course.title || 'Untitled course' }}</h2><p class="course-instructor">with {{ course.instructor || course.instructorName || 'EduPlatform instructor' }}</p>
          <div class="course-card-bottom"><span class="course-rating" v-if="course.rating">★ {{ course.rating }}</span><span v-else class="course-rating-placeholder">Learn at your pace</span><RouterLink :to="{ name: 'course-details', params: { id: course._id || course.id } }" class="text-link">View course <span>→</span></RouterLink></div>
        </div>
      </article>
    </div>
    <ApiFeedback :loading="loading" :error="error" :empty="!loading && !error && filteredCourses.length === 0" empty-title="No courses to show just yet" empty-message="Courses will appear here as soon as they’re available. Try again in a little while.">
      <button v-if="error" type="button" class="button button-outline" @click="loadCourses">Try again</button>
    </ApiFeedback>
  </section>
</template>
