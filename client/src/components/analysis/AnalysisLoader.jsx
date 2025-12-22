import { Sparkles, Scan, Brain, Pill, Dna } from 'lucide-react'
import { useState, useEffect } from 'react'

const steps = [
  { icon: Scan, text: 'Detecting facial features', subtext: 'Mapping your face structure...' },
  { icon: Brain, text: 'Analyzing skin conditions', subtext: 'Checking for issues...' },
  { icon: Sparkles, text: 'Evaluating skin health', subtext: 'Calculating metrics...' },
  { icon: Pill, text: 'Generating recommendations', subtext: 'Finding the best peptides...' },
]

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 3000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 200)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const CurrentIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main loader */}
      <div className="relative mb-8 z-10">
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-36 h-36 rounded-full bg-primary-500/20 blur-xl animate-pulse"></div>

        {/* Outer ring */}
        <div className="w-36 h-36 rounded-full border-4 border-dark-700"></div>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-36 h-36 -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="66"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 4.15} 415`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-lg animate-pulse">
            <CurrentIcon className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="text-center mb-8 z-10">
        <h2 className="text-2xl font-bold text-white mb-2">
          {steps[currentStep].text}
        </h2>
        <p className="text-dark-400">
          {steps[currentStep].subtext}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-3 mb-8 z-10">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          return (
            <div
              key={index}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                index === currentStep
                  ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow scale-110'
                  : index < currentStep
                  ? 'bg-accent-900/50 border border-accent-700/50'
                  : 'bg-dark-700/50 border border-dark-600'
              }`}
            >
              <StepIcon
                className={`w-5 h-5 ${
                  index === currentStep
                    ? 'text-white'
                    : index < currentStep
                    ? 'text-accent-400'
                    : 'text-dark-500'
                }`}
              />
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="w-72 h-2 bg-dark-700 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Percentage */}
      <p className="mt-3 text-primary-400 font-medium z-10">
        {Math.round(progress)}%
      </p>

      {/* Info text */}
      <p className="mt-6 text-dark-500 text-center max-w-md text-sm z-10">
        Our AI is carefully analyzing your facial features to provide personalized
        skincare recommendations. This usually takes 10-15 seconds.
      </p>
    </div>
  )
}
