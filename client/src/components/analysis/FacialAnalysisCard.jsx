import { Activity, Droplets, Sun, Clock } from 'lucide-react'

export default function FacialAnalysisCard({ analysis }) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Facial Analysis
      </h2>

      <div className="space-y-6">
        {/* Age & Gender */}
        <div className="flex gap-4">
          <div className="flex-1 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Estimated Age</p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.estimatedAge}
            </p>
          </div>
          <div className="flex-1 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Gender</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {analysis.gender}
            </p>
          </div>
        </div>

        {/* Skin Metrics */}
        <div className="space-y-4">
          <MetricBar
            icon={<Droplets className="w-5 h-5" />}
            label="Hydration Level"
            value={analysis.skinMetrics.hydration}
            color="blue"
          />
          <MetricBar
            icon={<Activity className="w-5 h-5" />}
            label="Skin Elasticity"
            value={analysis.skinMetrics.elasticity}
            color="green"
          />
          <MetricBar
            icon={<Sun className="w-5 h-5" />}
            label="Sun Damage"
            value={analysis.skinMetrics.sunDamage}
            color="orange"
            inverted
          />
          <MetricBar
            icon={<Clock className="w-5 h-5" />}
            label="Aging Signs"
            value={analysis.skinMetrics.agingSigns}
            color="purple"
            inverted
          />
        </div>

        {/* Detected Conditions */}
        {analysis.conditions.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Detected Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.conditions.map((condition) => (
                <span
                  key={condition}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
}

function MetricBar({ icon, label, value, color, inverted }) {
  const displayValue = inverted ? 100 - value : value
  const status = displayValue >= 70 ? 'Good' : displayValue >= 40 ? 'Fair' : 'Needs Attention'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-sm text-gray-500">{status}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  )
}
