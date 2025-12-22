import { Link } from 'react-router-dom'
import { Camera, Sparkles, Shield, Zap, Dna, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuthModal } from '../context/AuthModalContext'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { openRegisterModal } = useAuthModal()
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/50 rounded-full border border-primary-700/50 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-primary-300 text-sm font-medium">AI-Powered Skin Analysis</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Advanced Facial Analysis
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                Personalized Peptide Recommendations
              </span>
            </h1>

            <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-10">
              Upload your photo and receive AI-driven skincare recommendations
              tailored to your unique facial features and skin conditions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl shadow-glow-lg hover:shadow-glow transition-all transform hover:-translate-y-0.5"
              >
                <Dna className="w-5 h-5" />
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={openRegisterModal}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-dark-700/50 text-dark-200 font-semibold rounded-2xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all"
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Get personalized peptide recommendations in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Camera className="w-8 h-8 text-white" />}
            iconBg="from-primary-500 to-primary-700"
            step="1"
            title="Upload Photo"
            description="Take a selfie or upload an existing photo. Our AI analyzes facial features, skin texture, and conditions."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-white" />}
            iconBg="from-secondary-500 to-secondary-700"
            step="2"
            title="AI Analysis"
            description="Advanced facial recognition detects skin issues, aging signs, hydration levels, and more."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-white" />}
            iconBg="from-accent-500 to-accent-700"
            step="3"
            title="Get Recommendations"
            description="Receive personalized peptide and skincare recommendations based on your unique analysis."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-dark-800/50 border-y border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Why Choose Our Analysis?
              </h2>
              <div className="space-y-4">
                <BenefitItem text="Powered by advanced AI for accurate skin detection" />
                <BenefitItem text="Personalized peptide recommendations for your skin type" />
                <BenefitItem text="Results in seconds, not hours" />
                <BenefitItem text="Track your skin health over time" />
                <BenefitItem text="Based on scientific research and dermatology" />
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary-900/50 to-secondary-900/50 border border-dark-600 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-lg mb-6">
                    <Dna className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg">Advanced Peptide Science</p>
                  <p className="text-dark-400 text-sm mt-2">Tailored to your skin's unique needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-900/30 to-secondary-900/30 rounded-3xl border border-primary-700/30 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-lg flex-shrink-0">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Your Privacy Matters</h3>
                <p className="text-dark-300 max-w-xl">
                  Your photos are processed securely and never stored permanently.
                  We use industry-standard encryption to protect your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Skincare?
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto mb-8">
            Join thousands of users who have discovered their personalized peptide regimen
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl shadow-glow-lg hover:shadow-glow transition-all transform hover:-translate-y-0.5"
          >
            <Dna className="w-5 h-5" />
            Start Your Free Analysis
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, iconBg, step, title, description }) {
  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700 hover:border-primary-600/50 transition-all group">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg group-hover:shadow-glow transition-shadow`}>
          {icon}
        </div>
        <span className="text-4xl font-bold text-dark-600">{step}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-dark-400 leading-relaxed">{description}</p>
    </div>
  )
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-accent-900/50 flex items-center justify-center flex-shrink-0 border border-accent-700/50">
        <CheckCircle2 className="w-4 h-4 text-accent-400" />
      </div>
      <span className="text-dark-200">{text}</span>
    </div>
  )
}
