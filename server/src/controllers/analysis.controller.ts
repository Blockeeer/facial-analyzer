import { Request, Response, NextFunction } from 'express'
import { azureFaceService } from '../services/azure-face.service.js'
import { claudeService } from '../services/claude.service.js'
import { resultsStore } from '../utils/results-store.js'
import { v4 as uuidv4 } from 'crypto'

export async function analyzeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
      return
    }

    const imageBuffer = req.file.buffer

    // Step 1: Analyze face with Azure Face API
    const facialAnalysis = await azureFaceService.analyzeFace(imageBuffer)

    // Step 2: Get peptide recommendations from Claude
    const { recommendations, aiInsights } = await claudeService.getRecommendations(facialAnalysis)

    // Step 3: Create result object
    const id = uuidv4()
    const result = {
      id,
      createdAt: new Date().toISOString(),
      facialAnalysis,
      recommendations,
      aiInsights,
    }

    // Store result temporarily (in production, use a proper database)
    resultsStore.set(id, result)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function getResultController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params

  const result = resultsStore.get(id)

  if (!result) {
    res.status(404).json({
      success: false,
      error: 'Result not found',
    })
    return
  }

  res.json({
    success: true,
    data: result,
  })
}
