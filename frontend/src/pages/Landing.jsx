import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🔨',
    title: 'Prompt Builder',
    desc: 'Design structured prompts with roles, tones, and variable placeholders. Live preview as you type.',
    to: '/builder',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
  },
  {
    icon: '📚',
    title: 'Prompt Library',
    desc: 'Save, search, filter, and manage all your prompt templates in one place.',
    to: '/library',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
  },
  {
    icon: '🎮',
    title: 'Playground',
    desc: 'Run prompts against GPT-4, Gemini, and Claude simultaneously. Compare results side by side.',
    to: '/playground',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
  },
  {
    icon: '✨',
    title: 'Prompt Optimizer',
    desc: 'AI rewrites your prompt for clarity, specificity, and effectiveness with a before/after view.',
    to: '/optimizer',
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-100 dark:border-pink-800',
  },
  {
    icon: '📋',
    title: 'AI Evaluator',
    desc: 'Score prompts on clarity, grammar, completeness, and creativity. Get actionable feedback.',
    to: '/evaluator',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track usage metrics, evaluation scores, category distribution, and model performance.',
    to: '/dashboard',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-100 dark:border-indigo-800',
  },
]

const STATS = [
  { value: '10+', label: 'LLM Models' },
  { value: '3',   label: 'AI Providers' },
  { value: '6',   label: 'Core Features' },
  { value: '∞',   label: 'Prompts Possible' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Build',    desc: 'Create prompt templates with variables and structured fields.' },
  { step: '02', title: 'Test',     desc: 'Run your prompt in the Playground across multiple AI models.' },
  { step: '03', title: 'Evaluate', desc: 'Score quality with AI-powered rubrics and get feedback.' },
  { step: '04', title: 'Optimize', desc: 'Let AI rewrite and improve your prompt automatically.' },
]

export default function Landing() {
  return (
    <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 dark:from-indigo-800 dark:via-purple-900 dark:to-blue-900">
        {/* Background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full mb-6 backdrop-blur-sm">
            🚀 Enterprise-grade Prompt Engineering
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Build Better Prompts,<br />
            <span className="text-yellow-300">Faster.</span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            The all-in-one platform to create, test, evaluate, and optimize LLM prompts
            across OpenAI, Gemini, and Anthropic — all in one workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-lg"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              Six powerful tools, one unified platform — designed for developers, researchers, and teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc, to, color, bg, border }) => (
              <Link
                key={to}
                to={to}
                className={`group relative ${bg} border ${border} rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                  Open {title} <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">Four simple steps from idea to production-ready prompt.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Engineer Better Prompts?
          </h2>
          <p className="text-indigo-100 text-lg mb-10">
            Join now and start building smarter prompts in minutes — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/playground"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-lg"
            >
              Try Playground
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <span className="text-2xl">🧠</span> Prompt Toolkit
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/builder"    className="hover:text-white transition-colors">Builder</Link>
            <Link to="/library"    className="hover:text-white transition-colors">Library</Link>
            <Link to="/playground" className="hover:text-white transition-colors">Playground</Link>
            <Link to="/evaluator"  className="hover:text-white transition-colors">Evaluator</Link>
            <Link to="/optimizer"  className="hover:text-white transition-colors">Optimizer</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Enterprise Prompt Toolkit</p>
        </div>
      </footer>

    </div>
  )
}
