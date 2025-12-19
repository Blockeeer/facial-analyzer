import { PeptideRecommendation } from '../../types'
import { CheckCircle, Info } from 'lucide-react'

interface PeptideRecommendationsProps {
  recommendations: PeptideRecommendation[]
}

export default function PeptideRecommendations({
  recommendations,
}: PeptideRecommendationsProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Recommended Peptides
      </h2>

      <div className="space-y-4">
        {recommendations.map((peptide, index) => (
          <PeptideCard key={index} peptide={peptide} priority={index + 1} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          These recommendations are based on AI analysis of your facial features.
          Consult with a dermatologist or skincare professional before starting
          any new peptide regimen.
        </p>
      </div>
    </div>
  )
}

interface PeptideCardProps {
  peptide: PeptideRecommendation
  priority: number
}

function PeptideCard({ peptide, priority }: PeptideCardProps) {
  const priorityColors = {
    1: 'bg-green-100 text-green-700 border-green-200',
    2: 'bg-blue-100 text-blue-700 border-blue-200',
    3: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  const colorClass = priorityColors[priority as keyof typeof priorityColors] ||
    'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className={`p-4 rounded-lg border ${colorClass}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{peptide.name}</h3>
        <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
          Priority #{priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{peptide.description}</p>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Benefits:</h4>
        <ul className="space-y-1">
          {peptide.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {peptide.usage && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <p className="text-xs text-gray-500">
            <strong>Usage:</strong> {peptide.usage}
          </p>
        </div>
      )}
    </div>
  )
}
