import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 12000,
  },
  instructor: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  level: {
    type: String,
    trim: true,
    maxlength: 40,
    default: 'All levels',
  },
  duration: {
    type: String,
    trim: true,
    maxlength: 80,
    default: 'Self-paced',
  },
  price: {
    type: Number,
    min: 0,
    default: 0,
  },
  learningOutcomes: {
    type: [{ type: String, trim: true, maxlength: 500 }],
    default: [],
    validate: {
      validator: (outcomes) => outcomes.length <= 30,
      message: 'A course can have at most 30 learning outcomes.',
    },
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
  versionKey: false,
})

courseSchema.index({ status: 1, createdAt: -1 })

const Course = mongoose.model('Course', courseSchema)

export default Course
