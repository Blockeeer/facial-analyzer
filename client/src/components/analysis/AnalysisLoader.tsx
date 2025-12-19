import { Sparkles, Scan, Brain } from 'lucide-react'
import { useState, useEffect } from 'react'

const steps = [
  { icon: Scan, text: 'Detecting facial features...' },
  { icon: Brain, text: 'Analyzing skin conditions...' },
  { icon: Sparkles, text: 'Generating peptide recommendations...' },
]

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const CurrentIcon = steps[currentStep].icon

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
          <CurrentIcon className="w-12 h-12 text-primary-600" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-spin border-t-primary-600"></div>
      </div>

      <p className="mt-8 text-xl font-medium text-gray-900">
        {steps[currentStep].text}
      </p>

      <div className="flex gap-2 mt-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="mt-8 text-gray-500 text-center max-w-md">
        Our AI is carefully analyzing your facial features to provide personalized
        skincare recommendations. This usually takes about 10-15 seconds.
      </p>
    </div>
  )
}
