import { Router } from 'express'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { HttpError } from '../middleware/HttpError.js'

const router = Router()

function enrollmentCourse(enrollment) {
  const course = enrollment.course
  if (!course) return null
  return {
    _id: course._id,
    title: course.title,
    category: course.category,
    instructor: course.instructor,
    level: course.level,
    duration: course.duration,
    progress: enrollment.progress,
  }
}

router.get('/student/dashboard', requireAuth, requireRole('student', 'admin'), async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course')
    .sort({ createdAt: -1 })
  const enrolledCourses = enrollments.map(enrollmentCourse).filter(Boolean)

  res.status(200).json({
    success: true,
    data: {
      stats: {
        inProgress: enrolledCourses.filter((course) => course.progress < 100).length,
        completed: enrolledCourses.filter((course) => course.progress === 100).length,
        learningHours: 0,
      },
      enrolledCourses,
    },
  })
})

router.get('/admin/students', requireAuth, requireRole('admin'), async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email createdAt')
    .sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: { students } })
})

router.get('/admin/enrollments', requireAuth, requireRole('admin'), async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('student', 'name email')
    .populate('course', 'title category')
    .sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: { enrollments } })
})

router.get('/admin/dashboard', requireAuth, requireRole('admin'), async (req, res) => {
  const [totalStudents, totalCourses, totalEnrollments, recentCourses] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments({ status: 'published' }),
    Enrollment.countDocuments(),
    Course.find().sort({ createdAt: -1 }).limit(10),
  ])

  res.status(200).json({
    success: true,
    data: {
      stats: { totalStudents, totalCourses, totalEnrollments },
      courses: recentCourses,
    },
  })
})

router.use((req, res, next) => {
  next(new HttpError(404, 'Dashboard not found.'))
})

export default router
