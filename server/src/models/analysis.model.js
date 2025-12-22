import mongoose from 'mongoose'

const analysisResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageData: {
      type: String, // Base64 encoded image
      required: true,
    },
    facialAnalysis: {
      skinMetrics: {
        hydration: { type: Number, required: true },
        elasticity: { type: Number, required: true },
        sunDamage: { type: Number, required: true },
        agingSigns: { type: Number, required: true },
        texture: { type: Number, required: true },
        pigmentation: { type: Number, required: true },
      },
      conditions: [{ type: String }],
      mainIssues: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
          area: { type: String, required: true },
        },
      ],
      achievements: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          icon: { type: String, required: true },
        },
      ],
      overallScore: { type: Number, required: true },
    },
    recommendations: [
      {
        name: { type: String, required: true },
        category: { type: String },
        targetConditions: [{ type: String }],
      },
    ],
    aiInsights: { type: String },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries by user
analysisResultSchema.index({ userId: 1, createdAt: -1 })

export const AnalysisResult = mongoose.model('AnalysisResult', analysisResultSchema)
