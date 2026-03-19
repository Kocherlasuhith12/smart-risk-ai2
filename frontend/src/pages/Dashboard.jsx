import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  Activity,
  BellRing,
  BrainCircuit,
  LineChart as LineChartIcon,
  ArrowRight,
  UploadCloud,
  Cpu,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

const capabilityCards = [
  {
    title: 'Risk Prediction Engine',
    description: 'Multi-dimensional AI scoring for schedule, budget, scope, and delivery risk in real time.',
    icon: BrainCircuit,
    accent: 'from-violet-500/80 via-sky-500/70 to-emerald-400/70',
  },
  {
    title: 'Project Health Monitoring',
    description: 'Continuously tracks velocity, defect trends, and delivery health across all releases.',
    icon: Activity,
    accent: 'from-sky-500/80 via-cyan-500/70 to-blue-400/70',
  },
  {
    title: 'AI Decision Insights',
    description: 'Contextual recommendations on where to intervene and which risks to mitigate first.',
    icon: ShieldCheck,
    accent: 'from-emerald-500/80 via-teal-400/70 to-cyan-400/70',
  },
  {
    title: 'Real-time Risk Alerts',
    description: 'Adaptive alerts as probability thresholds are crossed or patterns emerge.',
    icon: BellRing,
    accent: 'from-amber-500/80 via-orange-500/70 to-rose-500/70',
  },
  {
    title: 'Predictive Analytics',
    description: 'Forecast sprint outcomes, delivery probability, and cost-of-delay scenarios.',
    icon: LineChartIcon,
    accent: 'from-indigo-500/80 via-purple-500/70 to-fuchsia-500/70',
  },
]

const riskDistributionData = [
  { name: 'High', value: 18, color: '#f97373' },
  { name: 'Medium', value: 32, color: '#fbbf24' },
  { name: 'Low', value: 50, color: '#34d399' },
]

const predictionTrendData = [
  { month: 'Jan', risk: 68, success: 42 },
  { month: 'Feb', risk: 61, success: 49 },
  { month: 'Mar', risk: 55, success: 58 },
  { month: 'Apr', risk: 49, success: 64 },
  { month: 'May', risk: 44, success: 71 },
  { month: 'Jun', risk: 39, success: 78 },
]

const healthTimelineData = [
  { label: 'Sprint 1', score: 62 },
  { label: 'Sprint 2', score: 67 },
  { label: 'Sprint 3', score: 73 },
  { label: 'Sprint 4', score: 78 },
  { label: 'Sprint 5', score: 82 },
]

const workflowSteps = [
  {
    title: 'Upload Project Data',
    description: 'Connect Jira, Git, CI/CD, and financial signals in minutes.',
    icon: UploadCloud,
  },
  {
    title: 'AI Risk Analysis',
    description: 'Our models analyze thousands of delivery and quality signals.',
    icon: Cpu,
  },
  {
    title: 'Risk Prediction',
    description: 'See probabilistic outcomes and risk scores for every project.',
    icon: AlertTriangle,
  },
  {
    title: 'Mitigation Strategies',
    description: 'Receive prioritized actions and what-if simulations.',
    icon: CheckCircle2,
  },
]

const sectionFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const totalRisk = useMemo(
    () => riskDistributionData.reduce((acc, item) => acc + item.value, 0),
    []
  )

  return (
    <div className="relative min-h-screen pb-16">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute top-40 -right-32 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-16 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-0">
        {/* Hero + primary CTA */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] lg:items-center"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-slate-900/60 px-3 py-1 text-xs font-medium text-violet-100 shadow-lg shadow-violet-900/40 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              AI-native software delivery risk intelligence
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                AI-Driven Software Project{' '}
                <span className="bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  Risk Intelligence
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Smart Risk AI continuously analyzes delivery signals, engineering behavior, and historical outcomes
                to predict where your software projects are most likely to slip—before it happens.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/add-project')}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(79,70,229,0.6)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Start Risk Analysis
                  <ArrowRight className="h-4 w-4" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/projects')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-100 shadow-sm backdrop-blur hover:border-slate-500/80 hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                View Live Dashboard
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-violet-500/60 bg-slate-900/80 backdrop-blur" />
                <div>
                  <p className="font-semibold text-slate-100">85% earlier risk detection</p>
                  <p>Teams see risk months before it hits production.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-emerald-500/60 bg-slate-900/80 backdrop-blur" />
                <div>
                  <p className="font-semibold text-slate-100">AI-backed decisions</p>
                  <p>Explainable insights for every project decision.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="glass-panel gradient-ring relative overflow-hidden border-slate-600/60 px-5 pb-5 pt-4"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),transparent_60%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),transparent_55%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Portfolio Risk Score
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">3.2 / 10</p>
                </div>
                <div className="pulse-glow flex h-14 w-14 items-center justify-center rounded-full bg-slate-950/80">
                  <span className="text-xs font-semibold text-emerald-300">Stable</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="glass-soft border-slate-600/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">Risk Distribution</p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      62% low risk
                    </span>
                  </div>
                  <div className="mt-2 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: '#020617',
                            border: '1px solid #1f2937',
                            borderRadius: 10,
                            padding: 8,
                            color: '#e2e8f0',
                          }}
                          itemStyle={{ color: '#e2e8f0' }}
                          labelStyle={{ color: '#e5e7eb', fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Total projects</span>
                    <span className="text-slate-100">{totalRisk}</span>
                  </div>
                </div>

                <div className="glass-soft border-slate-600/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">Prediction Trend</p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      +21% success
                    </span>
                  </div>
                  <div className="mt-2 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictionTrendData}>
                        <defs>
                          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          hide
                          domain={[0, 100]}
                        />
                        <Area
                          type="monotone"
                          dataKey="success"
                          stroke="#34d399"
                          strokeWidth={1.6}
                          fill="url(#successGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>On-time delivery probability</span>
                    <span className="text-emerald-300">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Capabilities */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                AI capabilities
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                Built for modern, AI-first software delivery
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilityCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.7)] backdrop-blur-lg"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-25 mix-blend-screen`}
                  />
                </div>
                <div className="relative space-y-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/80 text-violet-200 ring-1 ring-violet-500/40">
                    <card.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-50">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-300">{card.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      AI-optimized signal stack
                    </span>
                    <span className="text-slate-500 group-hover:text-slate-200">
                      Hover to amplify
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Workflow */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                How it works
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                From project data to AI-driven mitigation
              </h2>
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden border-slate-700/70 p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/5 to-transparent" />
            <div className="relative grid gap-6 md:grid-cols-4">
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  className="relative flex flex-col"
                >
                  {idx < workflowSteps.length - 1 && (
                    <div className="pointer-events-none absolute right-[-14%] top-9 hidden h-px w-[28%] bg-gradient-to-r from-slate-500/60 via-slate-300/70 to-transparent md:block">
                      <div className="absolute -top-[3px] right-0 h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                  )}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/80 text-sky-200 ring-1 ring-sky-500/40">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-700/80">
                      Step {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-50">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Data visualization panels */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Risk analytics
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                Enterprise-grade risk probability and prediction trends
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
            {/* Risk probability chart */}
            <div className="glass-panel border-slate-700/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-300">Risk probability over time</p>
                  <p className="text-[11px] text-slate-400">
                    AI-driven forecast of portfolio risk and on-time delivery.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Confidence 94%
                </span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionTrendData} margin={{ left: -20, right: 4, top: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#020617',
                        border: '1px solid #1f2937',
                        borderRadius: 10,
                        padding: 8,
                        color: '#e2e8f0',
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#e5e7eb', fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#f97373"
                      strokeWidth={1.7}
                      dot={{ r: 3 }}
                      activeDot={{ r: 4.2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#34d399"
                      strokeWidth={1.7}
                      dot={{ r: 3 }}
                      activeDot={{ r: 4.2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI recommendations panel */}
            <div className="glass-panel border-slate-700/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-300">AI recommendations</p>
                  <p className="text-[11px] text-slate-400">
                    Targeted mitigation strategies ranked by impact.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300 ring-1 ring-slate-600/80">
                  <Sparkles className="h-3 w-3 text-violet-300" />
                  <span>AI-prioritized</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-700">
                  <div>
                    <p className="font-semibold text-slate-50">
                      Stabilize high-variance team in critical path
                    </p>
                    <p className="mt-1 text-slate-300">
                      AI flags inconsistent velocity for a core service team impacting 2 release trains. Recommend
                      capacity rebalancing and scope isolation.
                    </p>
                  </div>
                  <span className="mt-0.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                    High impact
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-700/80">
                  <div>
                    <p className="font-semibold text-slate-50">
                      Reduce risk on upcoming release window
                    </p>
                    <p className="mt-1 text-slate-300">
                      Sprint-level prediction shows 74% on-time likelihood. Suggest front-loading integration tests
                      and removing one low-value epic.
                    </p>
                  </div>
                  <span className="mt-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    Medium impact
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-700/80">
                  <div>
                    <p className="font-semibold text-slate-50">
                      Lock in gains from last 3 sprints
                    </p>
                    <p className="mt-1 text-slate-300">
                      Delivery stability has improved by 21%. Recommend codifying new working agreements and updating
                      risk baselines across teams.
                    </p>
                  </div>
                  <span className="mt-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Low effort
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Enterprise benefits */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                Enterprise outcomes
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                Designed for CTOs, VPs of Engineering, and program leaders
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="glass-soft border border-emerald-500/40 p-4">
              <p className="text-xs font-semibold text-emerald-300">Early risk detection</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">3–6 months</p>
              <p className="mt-1 text-xs text-slate-300">
                See structural delivery risks quarters before they hit your roadmap.
              </p>
            </div>
            <div className="glass-soft border border-violet-500/40 p-4">
              <p className="text-xs font-semibold text-violet-300">AI decision support</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">100% coverage</p>
              <p className="mt-1 text-xs text-slate-300">
                Every project, every release, every planning cycle backed by AI.
              </p>
            </div>
            <div className="glass-soft border border-sky-500/40 p-4">
              <p className="text-xs font-semibold text-sky-300">Improved success rates</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">+25%</p>
              <p className="mt-1 text-xs text-slate-300">
                Portfolio-level uplift in on-time, on-budget delivery over 12 months.
              </p>
            </div>
            <div className="glass-soft border border-slate-600/80 p-4">
              <p className="text-xs font-semibold text-slate-300">Intelligent mitigation</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">Real-time</p>
              <p className="mt-1 text-xs text-slate-300">
                Dynamic playbooks that adapt as your data and reality change.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          variants={sectionFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="glass-panel relative overflow-hidden border-violet-500/40 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/25 via-indigo-500/10 to-sky-500/25 opacity-70" />
            <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-100">
                  Ready to see your risks before they become incidents?
                </p>
                <p className="mt-1 max-w-xl text-sm text-slate-50">
                  Connect your tools, stream your delivery data, and let Smart Risk AI surface the next
                  three risks your leadership team should care about.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/add-project')}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/90 px-5 py-2.5 text-sm font-semibold text-slate-50 ring-1 ring-white/15"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2">
                    Start AI analysis
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </motion.button>

                <Link
                  to="/projects"
                  className="text-xs font-medium text-slate-100 underline-offset-4 hover:underline"
                >
                  Or explore existing projects
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
