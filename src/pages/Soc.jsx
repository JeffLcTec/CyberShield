import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building2, ShieldCheck, Timer, Filter, TrendingUp, Wallet, Siren, ArrowRight, Users } from 'lucide-react'
import { useStore } from '../store'
import { computeScore } from '../lib/score'
import { mvpMetrics } from '../lib/metrics'
import { PLANS } from '../data/seed'
import { Badge, PageHeader, ScorePill, Stat, Bar } from '../components/ui'
import { crc, timeAgo, SEVERITY, ALERT_STATUS } from '../lib/format'

export default function Soc() {
  const { state, now } = useStore()
  const m = mvpMetrics(state)
  const mrr = state.clients.reduce((s, c) => s + (PLANS.find(p => p.id === c.plan)?.crc || 0), 0)
  const analysts = 3
  const pending = state.alerts
    .filter(a => a.status === 'nueva' || a.status === 'escalada' || a.status === 'en_analisis')
    .sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order || b.createdAt - a.createdAt)

  const withHistory = state.clients.filter(c => state.histories[c.id]?.length)
  const trend = Array.from({ length: 13 }, (_, i) => {
    const vals = withHistory.map(c => (i === 12 ? computeScore(state, c.id) : state.histories[c.id][i]))
    return { semana: i === 12 ? 'Hoy' : `S${i + 1}`, promedio: Math.round(vals.reduce((s, v) => s + v, 0) / (vals.length || 1)) }
  })

  return (
    <div>
      <PageHeader title="Centro de operaciones de seguridad" subtitle="Vista consolidada de todos los clientes y de las métricas de éxito del MVP." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={ShieldCheck} label="Cobertura del agente EDR" value={`${m.coverage.toFixed(1)} %`} hint="Meta: ≥ 95 % de los equipos" ok={m.coverage >= 95} />
        <Stat icon={Timer} label="Respuesta a incidentes críticos" value={m.avgCritResponse == null ? '—' : `${m.avgCritResponse.toFixed(0)} min`} hint="Meta: < 30 min en horario de atención" ok={m.avgCritResponse != null && m.avgCritResponse < 30} />
        <Stat icon={Filter} label="Falsos positivos" value={`${m.fpRate.toFixed(0)} %`} hint="Meta: < 20 % de las alertas cerradas" ok={m.fpRate < 20} />
        <Stat icon={TrendingUp} label="Mejora del CyberScore" value={`${m.avgDelta >= 0 ? '+' : ''}${m.avgDelta.toFixed(1)} pts`} hint="Meta: +10 pts promedio en 90 días" ok={m.avgDelta >= 10} />
        <Stat icon={Wallet} label="Ingreso mensual recurrente" value={crc(mrr)} hint={`${state.clients.length} clientes · ${state.clients.filter(c => c.status === 'piloto').length} en piloto`} />
        <Stat icon={Users} label="Carga del SOC" value={`${(state.clients.length / analysts).toFixed(1)} clientes/analista`} hint="Tope ético: 20 clientes por analista" ok={state.clients.length / analysts <= 20} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="card p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Clientes</h2>
            <Link to="/clientes" className="text-xs text-cyan-400 hover:underline">Ver todos →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-800"><th className="th">Empresa</th><th className="th">Plan</th><th className="th">CyberScore</th><th className="th">Cobertura</th><th className="th">Alertas</th></tr></thead>
              <tbody>
                {state.clients.map(c => {
                  const score = computeScore(state, c.id)
                  const first = state.histories[c.id]?.[0]
                  const eps = state.endpoints.filter(e => e.clientId === c.id)
                  const cov = eps.length ? Math.round((eps.filter(e => e.agent !== 'sin_agente').length / eps.length) * 100) : 0
                  const open = state.alerts.filter(a => a.clientId === c.id && !['resuelta', 'falso_positivo'].includes(a.status)).length
                  return (
                    <tr key={c.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                      <td className="td"><Link to={`/c/${c.id}`} className="font-medium text-slate-200 hover:text-cyan-300">{c.name}</Link><div className="text-xs text-slate-500">{c.sector}{c.status === 'piloto' && ' · Piloto'}</div></td>
                      <td className="td capitalize text-slate-300">{c.plan}</td>
                      <td className="td"><div className="flex items-center gap-2"><ScorePill score={score} />{first != null && <span className={`text-xs ${score - first >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{score - first >= 0 ? '▲' : '▼'} {Math.abs(score - first)}</span>}</div></td>
                      <td className="td w-32"><div className="flex items-center gap-2"><Bar value={cov} /><span className="text-xs text-slate-400">{cov}%</span></div></td>
                      <td className="td">{open ? <span className="font-semibold text-rose-300">{open}</span> : <span className="text-slate-500">0</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-1 font-semibold text-white">CyberScore promedio · últimos 90 días</h2>
          <p className="mb-4 text-xs text-slate-500">Clientes con historial completo</p>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -20, right: 8 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="semana" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="promedio" stroke="#22d3ee" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-white"><Siren className="h-4 w-4 text-rose-400" /> Requieren atención ({pending.length})</h2>
          <Link to="/alertas" className="text-xs text-cyan-400 hover:underline">Ir a la cola →</Link>
        </div>
        <div className="divide-y divide-slate-800">
          {pending.slice(0, 6).map(a => (
            <Link key={a.id} to={`/alertas?id=${a.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-slate-800/30">
              <Badge cls={SEVERITY[a.severity].cls}>{SEVERITY[a.severity].label}</Badge>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-200">{a.title}</div>
                <div className="text-xs text-slate-500">{state.clients.find(c => c.id === a.clientId)?.name} · {a.source} · {timeAgo(a.createdAt, now)}</div>
              </div>
              <Badge cls={ALERT_STATUS[a.status].cls}>{ALERT_STATUS[a.status].label}</Badge>
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </Link>
          ))}
          {!pending.length && <div className="py-6 text-center text-sm text-slate-500">Sin alertas pendientes. 🎉</div>}
        </div>
      </div>
    </div>
  )
}
