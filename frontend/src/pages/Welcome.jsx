import { Link } from 'react-router-dom'

/**
 * Welcome Page
 * Professional landing page shown to unauthenticated users
 * Features gradient background, key benefits showcase, and CTAs
 */

const FEATURES = [
  {
    icon: '🔨',
    title: 'Prompt Builder',
    desc: 'Design structured prompts with roles, tones, and variable placeholders.',
  },
  {
    icon: '🎮',
    title: 'Multi-Model Playground',
    desc: 'Test prompts against GPT-4, Gemini, and Claude simultaneously.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track usage metrics, evaluation scores, and model performance.',
  },
  {
    icon: '✨',
    title: 'AI Optimizer',
    desc: 'Automatic prompt improvements for clarity and effectiveness.',
  },
  {
    icon: '📋',
    title: 'Evaluator',
    desc: 'Score prompts on quality metrics with actionable feedback.',
  },
  {
    icon: '📚',
    title: 'Prompt Library',
    desc: 'Save, search, and manage all your prompt templates in one place.',
  },
]

const BENEFITS = [
  { label: 'AI Models', value: '10+' },
  { label: 'Providers', value: '3' },
  { label: 'Core Features', value: '6' },
  { label: 'Fastest Setup', value: '< 1 min' },
]

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🧠</span>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Prompt Toolkit
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 sm:px-8 lg:px-0">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl dark:bg-indigo-600/10" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl dark:bg-purple-600/10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-200 dark:border-indigo-700 mb-8">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Trusted by prompt engineers worldwide
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Engineer Better
            <span className="block text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mt-2">
              Prompts, Faster
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            The all-in-one platform to create, test, evaluate, and optimize LLM prompts across OpenAI, Gemini, and Anthropic.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all hover:scale-105 text-lg"
            >
              Create Free Account →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {BENEFITS.map(({ label, value }) => (
              <div key={label} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-0 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six powerful tools designed for prompt engineers, developers, and teams building with AI.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }, idx) => (
              <div
                key={title}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-0">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Your Journey to Prompt Mastery
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get started in under a minute. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Build', desc: 'Design your first prompt using our builder' },
              { step: '3', title: 'Test', desc: 'Run it across multiple AI models' },
              { step: '4', title: 'Optimize', desc: 'Get AI-powered suggestions to improve' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center mb-4 text-lg">
                    {step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
                </div>
                {step !== '4' && (
                  <div className="hidden md:block absolute top-6 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 px-6 sm:px-8 lg:px-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Save Time',
                desc: 'Engineer better prompts 10x faster with AI-powered tools and templates.',
              },
              {
                icon: '🎯',
                title: 'Better Results',
                desc: 'Systematically test and optimize prompts with real AI model comparisons.',
              },
              {
                icon: '📈',
                title: 'Stay Organized',
                desc: 'Centralize your prompts, evaluations, and analytics in one workspace.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 sm:px-8 lg:px-0">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Prompt Engineering?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of engineers building smarter prompts. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all border border-white/40"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-6 sm:px-8 lg:px-0 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
            <span className="text-2xl">🧠</span>
            <span>Prompt Toolkit</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Enterprise Prompt Engineering Toolkit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
