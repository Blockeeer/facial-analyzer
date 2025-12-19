import { Link } from 'react-router-dom'
import { Camera, Sparkles, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Facial Analysis
            <br />
            <span className="text-primary-600">Personalized Peptide Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Upload your photo and receive AI-driven skincare recommendations
            tailored to your unique facial features and skin conditions.
          </p>
          <Link to="/analyze" className="btn-primary text-lg px-8 py-3">
            Start Free Analysis
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Camera className="w-10 h-10 text-primary-600" />}
            title="Upload Photo"
            description="Take a selfie or upload an existing photo. Our AI analyzes facial features, skin texture, and conditions."
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-primary-600" />}
            title="AI Analysis"
            description="Advanced facial recognition detects skin issues, aging signs, hydration levels, and more."
          />
          <FeatureCard
            icon={<Sparkles className="w-10 h-10 text-primary-600" />}
            title="Get Recommendations"
            description="Receive personalized peptide and skincare recommendations based on your unique analysis."
          />
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Shield className="w-16 h-16 text-primary-400" />
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Your Privacy Matters</h3>
              <p className="text-gray-400 max-w-xl">
                Your photos are processed securely and never stored permanently.
                We use industry-standard encryption to protect your data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
