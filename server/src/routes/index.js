import { Router } from 'express'
import multer from 'multer'
import {
  analyzeController,
  getResultController,
  getUserHistoryController,
  deleteResultController,
} from '../controllers/analysis.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

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

// Protected analysis routes (require authentication)
router.post('/analyze', authMiddleware, upload.single('image'), analyzeController)
router.get('/results', authMiddleware, getUserHistoryController)
router.get('/results/:id', authMiddleware, getResultController)
router.delete('/results/:id', authMiddleware, deleteResultController)

export default router
