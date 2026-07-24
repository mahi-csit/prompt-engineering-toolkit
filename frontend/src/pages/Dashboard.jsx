import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../api/analytics'
import { useAuth } from '../context/AuthContext'

const QUICK_LINKS = [
  { to: '/builder',    label: 'Prompt Builder',  icon: '🔨', color: 'from-blue-500 to-blue-600',    desc: 'Create new prompt templates' },
  { to: '/library',    label: 'Prompt Library',  icon: '📚', color: 'from-purple-500 to-purple-600', desc: 'Browse and manage prompts' },
  { to: '/playground', label: 'Playground',      icon: '🎮', color: 'from-green-500 to-green-600',   desc: 'Test across multiple models' },
  { to: '/evaluator',  label: 'Evaluator',       icon: '📋', color: 'from-orange-500 to-orange-600', desc: 'Score prompt quality with AI' },
  { to: '/optimizer',  label: 'Optimizer',       icon: '✨', color: 'from-pink-500 to-pink-600',     desc: 'AI-powered improvements' },
]

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await analyticsAPI.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Analytics error:', err)
      // Show zeros instead of an error — dashboard is still usable
      setStats({
        total_prompts: 0,
        total_users: 0,
        total_evaluations: 0,
        active_prompts_last_30_days: 0,
        favorite_prompts: 0,
        evaluation_stats: { total_evaluations: 0, average_score: 0, score_distribution: {}, top_performing_prompts: [] },
        optimization_stats: { total_optimizations: 0, average_confidence: 0 },
        categories: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}{user?.username ? `, ${user.username}` : ''} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome to your Prompt Engineering Dashboard
          </p>
        </div>
        <Link
          to="/builder"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <span>+</span> New Prompt
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Prompts"        value={stats.total_prompts}                    icon="📝" color="from-blue-400 to-blue-600" />
          <StatCard label="Total Evaluations"    value={stats.total_evaluations}                icon="📊" color="from-purple-400 to-purple-600" />
          <StatCard label="Avg Eval Score"       value={stats.evaluation_stats.average_score > 0 ? stats.evaluation_stats.average_score.toFixed(1) : '—'} icon="⭐" color="from-yellow-400 to-orange-500" />
          <StatCard label="Active (30 days)"     value={stats.active_prompts_last_30_days}      icon="🔥" color="from-red-400 to-pink-600" />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {QUICK_LINKS.map(({ to, label, icon, color, desc }) => (
            <Link
              key={to}
              to={to}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl mb-3 shadow group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row: categories + top prompts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prompts by Category</h3>
            {stats.categories.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No prompts yet — <Link to="/builder" className="text-indigo-500 hover:underline">create one</Link></p>
            ) : (
              <div className="space-y-3">
                {stats.categories.slice(0, 6).map(({ category, count }) => {
                  const max = stats.categories[0]?.count || 1
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-28 shrink-0 truncate">{category}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Score Distribution */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Evaluation Score Distribution</h3>
            {stats.evaluation_stats.total_evaluations === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No evaluations yet — <Link to="/evaluator" className="text-indigo-500 hover:underline">evaluate a prompt</Link></p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.evaluation_stats.score_distribution).map(([label, count]) => {
                  const total = stats.evaluation_stats.total_evaluations || 1
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16 shrink-0">{label}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
