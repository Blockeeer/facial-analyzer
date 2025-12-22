import { aiLabService } from '../services/ailab.service.js'
import { claudeService } from '../services/claude.service.js'
import { AnalysisResult } from '../models/index.js'
import mongoose from 'mongoose'

// Flag to enable/disable Claude recommendations
const ENABLE_CLAUDE_RECOMMENDATIONS = true

export async function analyzeController(req, res, next) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
      return
    }

    const imageBuffer = req.file.buffer
    const userId = req.userId

    // Convert image to base64 for storage
    const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`

    // Step 1: Analyze skin with AILab Skin Analysis API
    console.log('🔄 Analyzing skin conditions...')
    const skinAnalysis = await aiLabService.analyzeFace(imageBuffer)

    // Step 2: Build facial analysis result (no age/gender)
    const facialAnalysis = {
      skinMetrics: skinAnalysis.skinMetrics,
      conditions: skinAnalysis.conditions,
      mainIssues: skinAnalysis.mainIssues,
      achievements: skinAnalysis.achievements,
      overallScore: skinAnalysis.overallScore,
    }

    console.log('✅ Skin analysis complete:', {
      issues: facialAnalysis.mainIssues?.length || 0,
      achievements: facialAnalysis.achievements?.length || 0,
      score: facialAnalysis.overallScore,
    })

    // Step 3: Get peptide recommendations from Claude
    let recommendations = []
    let aiInsights = 'Peptide recommendations will be available soon.'

    if (ENABLE_CLAUDE_RECOMMENDATIONS) {
      const claudeResult = await claudeService.getRecommendations(facialAnalysis)
      recommendations = claudeResult.recommendations
      aiInsights = claudeResult.aiInsights
    }

    // Step 4: Save to database (including the image)
    const result = await AnalysisResult.create({
      userId: new mongoose.Types.ObjectId(userId),
      imageData: imageBase64,
      facialAnalysis,
      recommendations,
      aiInsights,
    })

    res.json({
      success: true,
      data: {
        id: result._id,
        createdAt: result.createdAt,
        imageData: result.imageData,
        facialAnalysis: {
          skinMetrics: result.facialAnalysis.skinMetrics,
          conditions: result.facialAnalysis.conditions,
          mainIssues: result.facialAnalysis.mainIssues || [],
          achievements: result.facialAnalysis.achievements || [],
          overallScore: result.facialAnalysis.overallScore || 0,
        },
        recommendations: result.recommendations,
        aiInsights: result.aiInsights,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getResultController(req, res) {
  const { id } = req.params
  const userId = req.userId

  try {
    const result = await AnalysisResult.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    })

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Result not found',
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: result._id,
        createdAt: result.createdAt,
        imageData: result.imageData,
        facialAnalysis: {
          skinMetrics: result.facialAnalysis.skinMetrics,
          conditions: result.facialAnalysis.conditions,
          mainIssues: result.facialAnalysis.mainIssues || [],
          achievements: result.facialAnalysis.achievements || [],
          overallScore: result.facialAnalysis.overallScore || 0,
        },
        recommendations: result.recommendations,
        aiInsights: result.aiInsights,
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid result ID',
    })
  }
}

export async function getUserHistoryController(req, res, next) {
  try {
    const userId = req.userId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const results = await AnalysisResult.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id createdAt imageData facialAnalysis.estimatedAge facialAnalysis.conditions facialAnalysis.overallScore facialAnalysis.mainIssues')

    const total = await AnalysisResult.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    })

    res.json({
      success: true,
      data: {
        results: results.map((r) => ({
          id: r._id,
          createdAt: r.createdAt,
          imageData: r.imageData,
          estimatedAge: r.facialAnalysis.estimatedAge,
          conditions: r.facialAnalysis.conditions,
          overallScore: r.facialAnalysis.overallScore || 0,
          mainIssues: r.facialAnalysis.mainIssues || [],
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteResultController(req, res) {
  const { id } = req.params
  const userId = req.userId

  try {
    const result = await AnalysisResult.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    })

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Result not found',
      })
      return
    }

    res.json({
      success: true,
      message: 'Result deleted successfully',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid result ID',
    })
  }
}
