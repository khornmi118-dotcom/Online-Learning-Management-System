import { Router } from 'express'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { HttpError } from '../middleware/HttpError.js'
import { requireObjectId, validateCourseInput } from '../utils/validation.js'

const router = Router()

router.get('/', async (req, res) => {
  const courses = await Course.find({ status: 'published' }).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: { courses } })
})

router.get('/manage', requireAuth, requireRole('admin'), async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: { courses } })
})

router.get('/:id', async (req, res) => {
  const id = requireObjectId(req.params.id, 'course id')
  const course = await Course.findOne({ _id: id, status: 'published' })
  if (!course) throw new HttpError(404, 'Course not found.')
  res.status(200).json({ success: true, data: { course } })
})

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const values = validateCourseInput(req.body)
  const course = await Course.create({
    ...values,
    instructor: values.instructor || req.user.name,
    createdBy: req.user._id,
  })
  res.status(201).json({ success: true, data: { course } })
})

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireObjectId(req.params.id, 'course id')
  const values = validateCourseInput(req.body, { partial: true })
  const course = await Course.findByIdAndUpdate(id, values, {
    returnDocument: 'after',
    runValidators: true,
  })
  if (!course) throw new HttpError(404, 'Course not found.')
  res.status(200).json({ success: true, data: { course } })
})

router.patch('/:id/publish', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireObjectId(req.params.id, 'course id')
  const course = await Course.findByIdAndUpdate(
    id,
    { status: 'published' },
    { returnDocument: 'after', runValidators: true },
  )
  if (!course) throw new HttpError(404, 'Course not found.')
  res.status(200).json({ success: true, data: { course } })
})

router.patch('/:id/unpublish', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireObjectId(req.params.id, 'course id')
  const course = await Course.findByIdAndUpdate(
    id,
    { status: 'draft' },
    { returnDocument: 'after', runValidators: true },
  )
  if (!course) throw new HttpError(404, 'Course not found.')
  res.status(200).json({ success: true, data: { course } })
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = requireObjectId(req.params.id, 'course id')
  const course = await Course.findById(id)
  if (!course) throw new HttpError(404, 'Course not found.')

  await Enrollment.deleteMany({ course: id })
  await course.deleteOne()
  res.status(200).json({ success: true, message: 'Course deleted.' })
})

export default router
