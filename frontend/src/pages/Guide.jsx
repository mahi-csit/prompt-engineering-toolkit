import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const GUIDE_SECTIONS = [
  {
    id: 'playground',
    icon: '🎮',
    title: 'Playground',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    description: 'Test and compare your prompts across multiple AI models simultaneously',
    sections: [
      {
        title: 'What is the Playground?',
        content: 'The Playground lets you test a single prompt against different AI models (GPT-4, Claude, Gemini) at the same time. See how different models respond to the same prompt and compare their outputs side by side.'
      },
      {
        title: 'Step-by-step Instructions',
        steps: [
          'Enter your prompt in the text box on the left',
          'Adjust Temperature (0-1): Lower = more focused, Higher = more creative',
          'Set Max Tokens: How long the response can be (1-8192)',
          'Select which models to test (check the boxes)',
          'Click "Run Comparison" to execute',
          'Review results on the right side'
        ]
      },
      {
        title: 'Field Explanations',
        fields: [
          { label: 'Prompt', desc: 'Your question or instruction for the AI' },
          { label: 'Temperature', desc: 'Controls randomness. 0.7 is balanced, 0.3 is focused, 0.9 is creative' },
          { label: 'Max Tokens', desc: 'Response length limit. Start with 1024 for most tasks' },
          { label: 'Models', desc: 'Select which AI providers to test against' }
        ]
      },
      {
        title: 'Example',
        example: {
          prompt: 'Explain quantum computing in simple terms',
          temp: '0.7',
          tokens: '512',
          result: 'Will show outputs from all selected models side by side'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Test multiple models to find the best performer for your use case',
          '✓ Lower temperature (0.3-0.5) for factual tasks like data extraction',
          '✓ Higher temperature (0.8-1.0) for creative tasks like brainstorming',
          '✓ Start with a small Max Tokens and increase if responses seem cut off',
          '✓ Try the same prompt with different models to see which works best'
        ]
      }
    ]
  },
  {
    id: 'builder',
    icon: '🔨',
    title: 'Prompt Builder',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    description: 'Design and save reusable prompt templates with variables',
    sections: [
      {
        title: 'What is the Prompt Builder?',
        content: 'Create and save prompt templates that you can reuse. Add variables (placeholders) that change each time you use the prompt. Perfect for standardizing how you write prompts for similar tasks.'
      },
      {
        title: 'Step-by-step Instructions',
        steps: [
          'Enter a name for your prompt template',
          'Add a description of what this prompt does',
          'Choose a category (e.g., "Support", "Content", "Code")',
          'Add tags to make it easier to find (e.g., "email, customer-service")',
          'Write your prompt content using {{variable}} syntax',
          'Fill in variable definitions',
          'Click "Create Prompt" to save'
        ]
      },
      {
        title: 'Field Explanations',
        fields: [
          { label: 'Name', desc: 'A clear title for this template (e.g., "Customer Support Response")' },
          { label: 'Description', desc: 'What does this prompt do? When would you use it?' },
          { label: 'Category', desc: 'Type of prompt: Support, Content, Code, Analysis, etc.' },
          { label: 'Tags', desc: 'Comma-separated keywords to help you find it later' },
          { label: 'Prompt Content', desc: 'Your template text. Use {{variable_name}} for placeholders' },
          { label: 'Variables', desc: 'JSON format describing each variable' }
        ]
      },
      {
        title: 'Example',
        example: {
          name: 'Customer Support Response',
          desc: 'Generate professional support replies',
          content: 'You are a {{tone}} customer support agent. A customer wrote: "{{customer_message}}". Respond to {{num_sentences}} sentences.',
          variables: '{"tone": "Professional tone", "customer_message": "What customer said", "num_sentences": "How many sentences to write"}'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Use clear, descriptive variable names like {{tone}} not {{x}}',
          '✓ Add examples in your prompt so the AI knows what you want',
          '✓ Start vague and test, then refine based on results',
          '✓ Use categories to organize by department or function',
          '✓ Save templates you use frequently for quick access',
          '✓ The preview shows your prompt as you type'
        ]
      }
    ]
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Prompt Library',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    description: 'Browse, search, and manage all your saved prompt templates',
    sections: [
      {
        title: 'What is the Prompt Library?',
        content: 'Your collection of all saved prompts. Search, filter by category, view details, test in the Playground, optimize with AI, or delete prompts you no longer need.'
      },
      {
        title: 'Step-by-step Instructions',
        steps: [
          'View all your saved prompts in a list',
          'Use the search bar to find specific prompts by name or keywords',
          'Filter by category using the dropdown menu',
          'Click on any prompt to see full details',
          'Click "Test in Playground" to quickly test that prompt',
          'Click "Optimize" to get AI suggestions for improvement',
          'Click "Delete" to remove a prompt'
        ]
      },
      {
        title: 'What Information is Shown',
        fields: [
          { label: 'Name', desc: 'The title of your prompt' },
          { label: 'Description', desc: 'What the prompt does' },
          { label: 'Category', desc: 'How you organized it' },
          { label: 'Last Used', desc: 'When you last tested this prompt' },
          { label: 'Created Date', desc: 'When you created this template' }
        ]
      },
      {
        title: 'Example Workflow',
        example: {
          step1: 'Create prompt: "Customer Support Response"',
          step2: 'Save it to your Library',
          step3: 'Search for it later by name',
          step4: 'Click "Test" to use it in the Playground',
          step5: 'Compare results across models'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Keep your library organized with meaningful categories',
          '✓ Use tags to add extra search keywords',
          '✓ Regularly test your most-used prompts to ensure quality',
          '✓ Delete old or unused prompts to keep things tidy',
          '✓ Star favorite prompts for quick access',
          '✓ Export prompts to share with team members'
        ]
      }
    ]
  },
  {
    id: 'evaluator',
    icon: '📋',
    title: 'Evaluator',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
    description: 'Score your prompts on quality metrics using AI-powered evaluation',
    sections: [
      {
        title: 'What is the Evaluator?',
        content: 'Get AI-powered feedback on your prompts. The system scores them on clarity, grammar, completeness, and creativity. Understand what makes a good prompt and get specific suggestions for improvement.'
      },
      {
        title: 'Step-by-step Instructions',
        steps: [
          'Paste your prompt text in the input box',
          'Select which evaluation rubric to use (General or Coding)',
          'Optionally enter the expected output/result',
          'Click "Evaluate" to analyze the prompt',
          'Review the score breakdown',
          'Read the feedback and suggestions',
          'Use feedback to improve your prompt'
        ]
      },
      {
        title: 'Scoring Criteria',
        fields: [
          { label: 'Clarity', desc: 'Is the prompt easy to understand? No ambiguity?' },
          { label: 'Grammar', desc: 'Are there spelling or grammar errors?' },
          { label: 'Completeness', desc: 'Does it provide all needed context and instructions?' },
          { label: 'Creativity', desc: 'Does it encourage interesting, nuanced responses?' }
        ]
      },
      {
        title: 'Example',
        example: {
          prompt: 'write a poem about cats',
          issue: 'Vague - missing style, length, tone',
          improved: 'Write a 12-line haiku-style poem about tabby cats in a humorous tone',
          improvement: 'Score improved from 65 to 92'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Use "General" rubric for most prompts, "Coding" for programming tasks',
          '✓ Aim for a score above 80 for production prompts',
          '✓ Re-evaluate after making changes to track improvement',
          '✓ Pay attention to the "Completeness" score - add more context if low',
          '✓ Use scoring to benchmark your prompts against each other',
          '✓ Low clarity scores usually mean too much ambiguity'
        ]
      }
    ]
  },
  {
    id: 'optimizer',
    icon: '✨',
    title: 'Optimizer',
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-100 dark:border-pink-800',
    description: 'Get AI suggestions to improve your prompt effectiveness',
    sections: [
      {
        title: 'What is the Optimizer?',
        content: 'Let AI rewrite your prompt for better results. The optimizer suggests improvements for clarity, specificity, and effectiveness. See side-by-side before/after comparisons.'
      },
      {
        title: 'Step-by-step Instructions',
        steps: [
          'Paste your current prompt into the input box',
          'Optionally describe what you\'re trying to achieve',
          'Click "Optimize" to get suggestions',
          'Review the improved version',
          'See the confidence score (how sure the AI is about the improvement)',
          'Read the explanation of changes made',
          'Copy the optimized prompt to use it'
        ]
      },
      {
        title: 'What Gets Improved',
        fields: [
          { label: 'Clarity', desc: 'Removes ambiguity and unclear phrasing' },
          { label: 'Specificity', desc: 'Adds concrete details and examples' },
          { label: 'Structure', desc: 'Reorganizes for better flow and logic' },
          { label: 'Tone', desc: 'Adjusts the voice to match the task' }
        ]
      },
      {
        title: 'Example',
        example: {
          original: 'write something funny',
          optimized: 'Write a humorous Twitter post (max 280 characters) about software debugging that would appeal to developers',
          confidence: '92%',
          changes: 'Added platform, length, topic, audience, tone'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Use optimization to break through writer\'s block',
          '✓ High confidence scores (80%+) mean the optimization is strong',
          '✓ Don\'t blindly accept all changes - use as inspiration',
          '✓ Combine optimization with evaluation for best results',
          '✓ After optimization, test in Playground to verify improvement',
          '✓ Optimize both original and already-good prompts for new ideas'
        ]
      }
    ]
  },
  {
    id: 'dashboard',
    icon: '📊',
    title: 'Dashboard',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-100 dark:border-indigo-800',
    description: 'Track usage metrics and performance analytics for your prompts',
    sections: [
      {
        title: 'What is the Dashboard?',
        content: 'Your personal statistics hub. See how many prompts you\'ve created, evaluation scores, optimization results, and which categories you use most. Track your progress over time.'
      },
      {
        title: 'Key Metrics Explained',
        steps: [
          'Total Prompts: How many prompt templates you\'ve saved',
          'Total Evaluations: How many times you\'ve evaluated prompts',
          'Average Evaluation Score: Your typical prompt quality score (0-100)',
          'Active Prompts (30 days): How many unique prompts you\'ve used recently',
          'Top Categories: Which types of prompts you create most'
        ]
      },
      {
        title: 'What Information is Shown',
        fields: [
          { label: 'Statistics Cards', desc: 'Quick overview of your activity' },
          { label: 'Quick Links', desc: 'Fast access to all features' },
          { label: 'Category Breakdown', desc: 'Visual chart of your prompt categories' },
          { label: 'Score Distribution', desc: 'How your evaluation scores are spread' }
        ]
      },
      {
        title: 'Example Insights',
        example: {
          total: '47 prompts created',
          active: '12 used in last 30 days',
          topCategory: 'Customer Support (15 prompts)',
          avgScore: '78/100'
        }
      },
      {
        title: 'Tips & Best Practices',
        tips: [
          '✓ Check the dashboard weekly to track your improvement',
          '✓ Use the Quick Links to jump directly to features',
          '✓ Low average score? Spend time optimizing existing prompts',
          '✓ Monitor which categories you use most - focus on those',
          '✓ Share your best-scoring prompts with teammates',
          '✓ Use analytics to identify patterns in what works'
        ]
      }
    ]
  }
]

function ExpandableSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white text-left">{title}</h4>
        <ChevronDown
          size={20}
          className={`text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  )
}

function FeatureGuide({ section }) {
  return (
    <div className={`border-l-4 border-l-gradient rounded-lg p-8 ${section.bg}`}>
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-4xl shadow-lg flex-shrink-0`}>
          {section.icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{section.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {section.sections.map((subsection, idx) => (
          <div key={idx}>
            {subsection.content && (
              <ExpandableSection title={subsection.title} defaultOpen={idx < 2}>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {subsection.content}
                </p>
              </ExpandableSection>
            )}

            {subsection.steps && (
              <ExpandableSection title={subsection.title} defaultOpen={idx < 2}>
                <ol className="space-y-3">
                  {subsection.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </ExpandableSection>
            )}

            {subsection.fields && (
              <ExpandableSection title={subsection.title} defaultOpen={idx < 2}>
                <div className="space-y-4">
                  {subsection.fields.map((field, i) => (
                    <div key={i} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                        {field.label}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{field.desc}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {subsection.example && (
              <ExpandableSection title={subsection.title} defaultOpen={false}>
                <div className="bg-gray-900 dark:bg-black rounded-lg p-6 text-gray-100 font-mono text-sm space-y-4 overflow-x-auto">
                  {Object.entries(subsection.example).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-indigo-400">{key}:</span>
                      <span className="text-green-400 ml-2 break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {subsection.tips && (
              <ExpandableSection title={subsection.title} defaultOpen={false}>
                <ul className="space-y-3">
                  {subsection.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-green-600 dark:text-green-400 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </ExpandableSection>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          to={`/${section.id === 'dashboard' ? 'dashboard' : section.id === 'builder' ? 'builder' : section.id === 'library' ? 'library' : section.id === 'playground' ? 'playground' : section.id === 'evaluator' ? 'evaluator' : 'optimizer'}`}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${section.color} text-white rounded-lg font-medium hover:shadow-lg transition-shadow`}
        >
          Try {section.title} Now →
        </Link>
      </div>
    </div>
  )
}

export default function Guide() {
  const [selectedGuide, setSelectedGuide] = useState(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📚 Complete User Guide
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Learn how to use every feature of Prompt Toolkit. Each section includes step-by-step instructions, examples, and best practices.
        </p>
      </div>

      {/* Feature Cards Grid */}
      {!selectedGuide && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDE_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedGuide(section.id)}
              className={`text-left p-6 rounded-lg border ${section.border} ${section.bg} hover:shadow-lg transition-all hover:-translate-y-1 group`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                {section.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {section.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Learn More <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Guide View */}
      {selectedGuide && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGuide(null)}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
          >
            ← Back to all guides
          </button>

          <FeatureGuide section={GUIDE_SECTIONS.find(s => s.id === selectedGuide)} />

          {/* Navigation Between Guides */}
          <div className="flex gap-4 justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                const currentIdx = GUIDE_SECTIONS.findIndex(s => s.id === selectedGuide)
                if (currentIdx > 0) {
                  setSelectedGuide(GUIDE_SECTIONS[currentIdx - 1].id)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              disabled={GUIDE_SECTIONS.findIndex(s => s.id === selectedGuide) === 0}
            >
              ← Previous
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {GUIDE_SECTIONS.findIndex(s => s.id === selectedGuide) + 1} of {GUIDE_SECTIONS.length}
            </div>

            <button
              onClick={() => {
                const currentIdx = GUIDE_SECTIONS.findIndex(s => s.id === selectedGuide)
                if (currentIdx < GUIDE_SECTIONS.length - 1) {
                  setSelectedGuide(GUIDE_SECTIONS[currentIdx + 1].id)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              disabled={GUIDE_SECTIONS.findIndex(s => s.id === selectedGuide) === GUIDE_SECTIONS.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Footer with Quick Tips */}
      {!selectedGuide && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Quick Tips for Success</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">1.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Start in the Builder</strong> to create your first prompt template</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">2.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Test in Playground</strong> to see how AI models respond</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">3.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Evaluate for Quality</strong> to get improvement suggestions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">4.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Optimize with AI</strong> to refine your wording</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">5.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Save to Library</strong> for reuse later</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">6.</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Track on Dashboard</strong> to see your progress</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
