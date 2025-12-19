import { Router } from 'express'
import multer from 'multer'
import { analyzeController, getResultController } from '../controllers/analysis.controller.js'

const router = Router()

// Configure multer for image uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'))
    }
  },
})

// Analysis routes
router.post('/analyze', upload.single('image'), analyzeController)
router.get('/results/:id', getResultController)

export default router
