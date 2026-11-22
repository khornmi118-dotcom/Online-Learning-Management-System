import { Router } from 'express'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { HttpError } from '../middleware/HttpError.js'
import { requireObjectId } from '../utils/validation.js'

const router = Router()
router.use(requireAuth, requireRole('student', 'admin'))

function courseSummary(enrollment) {
  const course = enrollment.course
  return {
    _id: course._id,
    title: course.title,
    category: course.category,
    instructor: course.instructor,
    level: course.level,
    duration: course.duration,
    progress: enrollment.progress,
    enrollmentId: enrollment._id,
  }
}

router.post('/:courseId', async (req, res) => {
  const courseId = requireObjectId(req.params.courseId, 'course id')
  const course = await Course.findOne({ _id: courseId, status: 'published' })
  if (!course) throw new HttpError(404, 'Course not found.')

  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id })

  res.status(201).json({
    success: true,
    data: {
      enrollment,
      course,
    },
  })
})

router.get('/my-courses', async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course')
    .sort({ createdAt: -1 })
  const enrolledCourses = enrollments
    .filter((enrollment) => enrollment.course)
    .map(courseSummary)

  res.status(200).json({ success: true, data: { enrolledCourses } })
})

export default router
