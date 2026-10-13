import { scoreBand } from '../lib/score'

export function Badge({ cls, children }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{children}</span>
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

export function Stat({ icon: Icon, label, value, hint, tone = 'text-cyan-300', ok }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
        {Icon && <Icon className={`h-4 w-4 ${tone}`} />}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint && (
        <div className={`mt-1 text-xs ${ok === undefined ? 'text-slate-400' : ok ? 'text-emerald-400' : 'text-rose-400'}`}>
          {ok !== undefined && (ok ? '✓ ' : '✗ ')}{hint}
        </div>
      )}
    </div>
  )
}

export function ScoreGauge({ score, size = 220, label = true }) {
  const band = scoreBand(score)
  const r = 80
  const c = Math.PI * r
  const off = c * (1 - score / 100)
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.62} viewBox="0 0 200 124">
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke={band.hex} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .8s ease, stroke .4s' }} />
        <text x="100" y="98" textAnchor="middle" fontSize="44" fontWeight="700" fill="currentColor" className="text-white">{score}</text>
        <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#94a3b8">de 100</text>
      </svg>
      {label && <Badge cls={`${band.bg} ${band.color} ${band.ring}`}>{band.label}</Badge>}
    </div>
  )
}

export function ScorePill({ score }) {
  const b = scoreBand(score)
  return <span className={`inline-flex min-w-11 justify-center rounded-lg px-2 py-1 text-sm font-semibold ring-1 ring-inset ${b.bg} ${b.color} ${b.ring}`}>{score}</span>
}

export function Bar({ value, color }) {
  const bg = color || (value >= 80 ? 'bg-emerald-400' : value >= 60 ? 'bg-amber-300' : value >= 40 ? 'bg-orange-400' : 'bg-rose-400')
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${bg} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function Empty({ children }) {
  return <div className="px-4 py-10 text-center text-sm text-slate-500">{children}</div>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button className="btn-ghost px-2 py-1" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
