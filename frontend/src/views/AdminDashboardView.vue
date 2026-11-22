<script setup>
import { onMounted, ref } from 'vue'
import ApiFeedback from '../components/ApiFeedback.vue'
import {
  createCourse,
  deleteCourse,
  errorMessage,
  getAdminCourses,
  getAdminDashboard,
  getAdminEnrollments,
  getAdminStudents,
  payloadOf,
  publishCourse,
  unpublishCourse,
  updateCourse,
} from '../services/api'

const data = ref(null)
const courses = ref([])
const students = ref([])
const enrollments = ref([])
const loading = ref(true)
const error = ref('')
const formError = ref('')
const notice = ref('')
const saving = ref(false)
const deletingCourseId = ref('')
const statusUpdatingId = ref('')
const editingCourseId = ref('')
const formOpen = ref(false)

function emptyCourseForm() {
  return {
    title: '',
    description: '',
    instructor: '',
    category: '',
    level: 'All levels',
    duration: 'Self-paced',
    price: 0,
    learningOutcomes: '',
    status: 'published',
  }
}

const form = ref(emptyCourseForm())

async function loadDashboard({ silent = false } = {}) {
  if (!silent) loading.value = true
  error.value = ''
  try {
    const [dashboardResponse, coursesResponse, studentsResponse, enrollmentsResponse] = await Promise.all([
      getAdminDashboard(),
      getAdminCourses(),
      getAdminStudents(),
      getAdminEnrollments(),
    ])
    data.value = payloadOf(dashboardResponse) || {}
    const courseResult = payloadOf(coursesResponse)
    const studentResult = payloadOf(studentsResponse)
    const enrollmentResult = payloadOf(enrollmentsResponse)
    courses.value = Array.isArray(courseResult) ? courseResult : courseResult?.courses || []
    students.value = studentResult?.students || []
    enrollments.value = enrollmentResult?.enrollments || []
    return true
  } catch (cause) {
    error.value = errorMessage(cause)
    return false
  } finally {
    if (!silent) loading.value = false
  }
}

function openCreateForm() {
  editingCourseId.value = ''
  form.value = emptyCourseForm()
  formError.value = ''
  notice.value = ''
  formOpen.value = true
}

function editCourse(course) {
  editingCourseId.value = course._id
  form.value = {
    title: course.title || '',
    description: course.description || '',
    instructor: course.instructor || '',
    category: course.category || '',
    level: course.level || 'All levels',
    duration: course.duration || 'Self-paced',
    price: course.price ?? 0,
    learningOutcomes: Array.isArray(course.learningOutcomes)
      ? course.learningOutcomes.join('\n')
      : '',
    status: course.status || 'published',
  }
  formError.value = ''
  notice.value = ''
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingCourseId.value = ''
  form.value = emptyCourseForm()
  formError.value = ''
}

async function submitCourse() {
  saving.value = true
  formError.value = ''
  notice.value = ''
  const course = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    ...(form.value.instructor.trim() ? { instructor: form.value.instructor.trim() } : {}),
    category: form.value.category.trim(),
    level: form.value.level.trim(),
    duration: form.value.duration.trim(),
    price: Number(form.value.price),
    learningOutcomes: form.value.learningOutcomes
      .split('\n')
      .map((outcome) => outcome.trim())
      .filter(Boolean),
    status: form.value.status,
  }

  try {
    if (editingCourseId.value) {
      await updateCourse(editingCourseId.value, course)
      notice.value = 'Course updated.'
    } else {
      await createCourse(course)
      notice.value = 'Course created.'
    }
    closeForm()
    await loadDashboard({ silent: true })
  } catch (cause) {
    formError.value = errorMessage(cause)
  } finally {
    saving.value = false
  }
}

async function removeCourse(course) {
  if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return

  deletingCourseId.value = course._id
  formError.value = ''
  notice.value = ''
  try {
    await deleteCourse(course._id)
    if (editingCourseId.value === course._id) closeForm()
    notice.value = 'Course deleted.'
    await loadDashboard({ silent: true })
  } catch (cause) {
    formError.value = errorMessage(cause)
  } finally {
    deletingCourseId.value = ''
  }
}

async function toggleCourseStatus(course) {
  statusUpdatingId.value = course._id
  formError.value = ''
  notice.value = ''
  const status = course.status === 'published' ? 'draft' : 'published'
  try {
    if (status === 'published') await publishCourse(course._id)
    else await unpublishCourse(course._id)
    notice.value = `Course ${status === 'published' ? 'published' : 'unpublished'}.`
    await loadDashboard({ silent: true })
  } catch (cause) {
    formError.value = errorMessage(cause)
  } finally {
    statusUpdatingId.value = ''
  }
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

onMounted(loadDashboard)
</script>

<template>
  <section class="page-container page-section dashboard-page">
    <div class="dashboard-welcome">
      <div>
        <p class="section-overline">Platform overview</p>
        <h1>Admin dashboard.</h1>
        <p>A clear view of your learning community.</p>
      </div>
      <button type="button" class="button button-outline" @click="loadDashboard()" :disabled="loading">
        {{ loading ? 'Refreshing…' : '↻ Refresh' }}
      </button>
    </div>

    <ApiFeedback :loading="loading" :error="error" :empty="false">
      <button v-if="error" type="button" class="button button-outline" @click="loadDashboard()">Try again</button>
    </ApiFeedback>

    <template v-if="!loading && !error">
      <div class="dashboard-stat-grid admin-stat-grid">
        <article>
          <span class="dashboard-stat-icon stat-peach">◉</span>
          <div><small>Total learners</small><b>{{ data?.stats?.totalStudents ?? 0 }}</b></div>
        </article>
        <article>
          <span class="dashboard-stat-icon stat-lilac">▤</span>
          <div><small>Published courses</small><b>{{ data?.stats?.totalCourses ?? 0 }}</b></div>
        </article>
        <article>
          <span class="dashboard-stat-icon stat-mint">✳</span>
          <div><small>Active enrollments</small><b>{{ data?.stats?.totalEnrollments ?? 0 }}</b></div>
        </article>
      </div>

      <section id="courses" class="admin-management" aria-labelledby="course-management-heading">
        <div class="dashboard-section-heading admin-management-heading">
          <div>
            <p class="section-overline">Manage your catalog</p>
            <h2 id="course-management-heading">Courses</h2>
          </div>
          <button type="button" class="button button-primary" @click="openCreateForm">Add course</button>
        </div>

        <p v-if="notice" class="form-success" role="status">{{ notice }}</p>
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <form v-if="formOpen" class="course-management-form" @submit.prevent="submitCourse">
          <h3>{{ editingCourseId ? 'Edit course' : 'Create a course' }}</h3>
          <div class="course-form-grid">
            <label class="form-field">
              <span>Course title</span>
              <input v-model="form.title" type="text" maxlength="160" required />
            </label>
            <label class="form-field">
              <span>Instructor (optional)</span>
              <input v-model="form.instructor" type="text" maxlength="120" placeholder="Defaults to your account name" />
            </label>
            <label class="form-field">
              <span>Category</span>
              <input v-model="form.category" type="text" maxlength="80" required />
            </label>
            <label class="form-field">
              <span>Level</span>
              <input v-model="form.level" type="text" maxlength="40" />
            </label>
            <label class="form-field">
              <span>Duration</span>
              <input v-model="form.duration" type="text" maxlength="80" />
            </label>
            <label class="form-field">
              <span>Price</span>
              <input v-model.number="form.price" type="number" min="0" step="0.01" required />
            </label>
            <label class="form-field">
              <span>Status</span>
              <select v-model="form.status">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label class="form-field course-form-wide">
              <span>Description</span>
              <textarea v-model="form.description" maxlength="12000" rows="5" required></textarea>
            </label>
            <label class="form-field course-form-wide">
              <span>Learning outcomes (one per line)</span>
              <textarea v-model="form.learningOutcomes" rows="4" placeholder="Build practical skills&#10;Apply what you learn"></textarea>
            </label>
          </div>
          <div class="course-form-actions">
            <button type="submit" class="button button-primary" :disabled="saving">
              {{ saving ? 'Saving…' : editingCourseId ? 'Save changes' : 'Create course' }}
            </button>
            <button type="button" class="button button-outline" :disabled="saving" @click="closeForm">Cancel</button>
          </div>
        </form>

        <div v-if="courses.length" class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Course</th><th>Instructor</th><th>Category</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="course in courses" :key="course._id">
                <td><b>{{ course.title || 'Untitled course' }}</b></td>
                <td>{{ course.instructor || '—' }}</td>
                <td>{{ course.category || '—' }}</td>
                <td><span class="status-pill" :class="{ 'status-draft': course.status === 'draft' }">{{ course.status || 'Published' }}</span></td>
                <td>
                  <div class="admin-course-actions">
                    <button type="button" class="button button-outline button-small" @click="editCourse(course)">Edit</button>
                    <button
                      type="button"
                      class="button button-outline button-small"
                      :disabled="statusUpdatingId === course._id || deletingCourseId === course._id"
                      @click="toggleCourseStatus(course)"
                    >
                      {{ statusUpdatingId === course._id ? 'Updating…' : course.status === 'published' ? 'Unpublish' : 'Publish' }}
                    </button>
                    <button
                      type="button"
                      class="button button-danger button-small"
                      :disabled="deletingCourseId === course._id"
                      @click="removeCourse(course)"
                    >
                      {{ deletingCourseId === course._id ? 'Deleting…' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ApiFeedback
          v-else
          :empty="true"
          empty-title="Your course catalog is ready for its first addition"
          empty-message="Create a course here to make it available in your catalog."
        />
      </section>

      <section id="students" class="admin-management" aria-labelledby="student-management-heading">
        <div class="dashboard-section-heading admin-management-heading">
          <div>
            <p class="section-overline">Accounts</p>
            <h2 id="student-management-heading">Students</h2>
          </div>
        </div>
        <div v-if="students.length" class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Registered</th></tr></thead>
            <tbody>
              <tr v-for="student in students" :key="student._id">
                <td><b>{{ student.name }}</b></td>
                <td>{{ student.email }}</td>
                <td>{{ formatDate(student.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ApiFeedback v-else :empty="true" empty-title="No students yet" empty-message="Registered student accounts will appear here." />
      </section>

      <section id="enrollments" class="admin-management" aria-labelledby="enrollment-management-heading">
        <div class="dashboard-section-heading admin-management-heading">
          <div>
            <p class="section-overline">Learning activity</p>
            <h2 id="enrollment-management-heading">Enrollments</h2>
          </div>
        </div>
        <div v-if="enrollments.length" class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Progress</th><th>Enrolled</th></tr></thead>
            <tbody>
              <tr v-for="enrollment in enrollments" :key="enrollment._id">
                <td><b>{{ enrollment.student?.name || 'Unknown student' }}</b></td>
                <td>{{ enrollment.student?.email || '—' }}</td>
                <td>{{ enrollment.course?.title || 'Unavailable course' }}</td>
                <td>{{ enrollment.progress ?? 0 }}%</td>
                <td>{{ formatDate(enrollment.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ApiFeedback v-else :empty="true" empty-title="No enrollments yet" empty-message="Course enrollments will appear here." />
      </section>
    </template>
  </section>
</template>
