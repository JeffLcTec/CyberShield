import { Link, useParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Monitor, Siren, Bug, KeyRound, Info, ArrowRight, Zap } from 'lucide-react'
import { useStore } from '../store'
import { computeFactors, computeScore, FACTORS, recommendations, scoreBand } from '../lib/score'
import { Badge, Bar, PageHeader, ScoreGauge, Stat } from '../components/ui'
import { SEVERITY, ALERT_STATUS, timeAgo } from '../lib/format'

const AREA_LINK = { edr: 'equipos', patches: 'vulnerabilidades', mfa: 'postura', email: 'postura', backup: 'postura' }

export default function ClientDashboard() {
  const { clientId } = useParams()
  const { state, user, now, simulateAttack } = useStore()
  const client = state.clients.find(c => c.id === clientId)
  if (!client) return <p className="text-slate-400">Cliente no encontrado.</p>

  const score = computeScore(state, clientId)
  const f = computeFactors(state, clientId)
  const band = scoreBand(score)
  const recs = recommendations(state, clientId)
  const hist = state.histories[clientId] || []
  const trend = [...hist.slice(0, 12).map((v, i) => ({ semana: `S${i + 1}`, score: v })), { semana: 'Hoy', score }]
  const eps = state.endpoints.filter(e => e.clientId === clientId)
  const alerts = state.alerts.filter(a => a.clientId === clientId)
  const openAlerts = alerts.filter(a => !['resuelta', 'falso_positivo'].includes(a.status))
  const vulns = state.vulns.filter(v => v.clientId === clientId && v.status === 'abierta')
  const isSoc = user.role === 'soc'

  const message = score >= 80 ? 'Su empresa mantiene buenas prácticas. Siga atendiendo las recomendaciones para sostener el nivel.'
    : score >= 60 ? 'Su empresa tiene una base razonable, pero hay brechas que un atacante podría aprovechar.'
    : score >= 40 ? 'Hay debilidades importantes. Atender las recomendaciones de abajo reduce el riesgo de forma significativa.'
    : 'La exposición es alta. Recomendamos atender las acciones prioritarias esta misma semana.'

  return (
    <div>
      <PageHeader title={client.name} subtitle={`${client.sector} · ${client.location} · Plan ${client.plan}`}>
        {isSoc && <button className="btn-danger" onClick={() => simulateAttack(clientId)}><Zap className="h-4 w-4" /> Simular ataque</button>}
        <Link to={`/c/${clientId}/reporte`} className="btn-ghost">Ver reporte mensual</Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card flex flex-col items-center p-6 text-center">
          <h2 className="mb-2 self-start text-sm font-semibold text-slate-300">CyberScore</h2>
          <ScoreGauge score={score} size={260} />
          <p className="mt-4 text-sm text-slate-300">{message}</p>
          {hist.length > 0 && (
            <p className={`mt-2 text-xs ${score - hist[0] >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {score - hist[0] >= 0 ? '▲' : '▼'} {Math.abs(score - hist[0])} puntos desde el inicio del servicio ({hist[0]})
            </p>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-800/50 p-3 text-left text-xs text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
            El CyberScore resume cinco controles básicos. Un puntaje alto reduce el riesgo, pero ningún servicio garantiza un 100 % de protección.
          </div>
        </div>

        <div className="card p-6 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">¿De qué se compone su puntaje?</h2>
          <div className="space-y-4">
            {FACTORS.map(x => (
              <Link key={x.key} to={`/c/${clientId}/${AREA_LINK[x.key]}`} className="block rounded-lg p-2 transition hover:bg-slate-800/40">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <div><span className="font-medium text-slate-200">{x.label}</span> <span className="text-xs text-slate-500">· peso {x.weight} %</span></div>
                  <span className="font-semibold text-white">{f[x.key]}<span className="text-xs text-slate-500">/100</span></span>
                </div>
                <Bar value={f[x.key]} />
                <div className="mt-1 text-xs text-slate-500">{x.plain}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Monitor} label="Equipos protegidos" value={`${eps.filter(e => e.agent === 'protegido').length}/${eps.length}`} hint={`${eps.filter(e => e.agent === 'sin_agente').length} sin agente · ${eps.filter(e => e.agent === 'aislado').length} aislados`} />
        <Stat icon={Siren} label="Alertas abiertas" value={openAlerts.length} tone="text-rose-400" hint={`${openAlerts.filter(a => a.severity === 'critica').length} críticas`} />
        <Stat icon={Bug} label="Vulnerabilidades abiertas" value={vulns.length} tone="text-orange-400" hint={`${vulns.filter(v => v.severity === 'critica').length} críticas`} />
        <Stat icon={KeyRound} label="Cuentas con MFA" value={`${state.accounts.filter(a => a.clientId === clientId && a.mfa).length}/${state.accounts.filter(a => a.clientId === clientId).length}`} tone="text-emerald-400" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-300">Acciones recomendadas</h2>
          <p className="mb-4 text-xs text-slate-500">Ordenadas por el impacto estimado en su CyberScore.</p>
          <div className="space-y-3">
            {recs.map((r, i) => (
              <Link key={r.id} to={`/c/${clientId}/${AREA_LINK[r.area]}`} className="flex gap-3 rounded-lg border border-slate-800 p-3 transition hover:border-cyan-500/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-200">{r.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.detail}</div>
                </div>
                <span className="self-center whitespace-nowrap rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">+{r.gain} pts</span>
              </Link>
            ))}
            {!recs.length && <p className="text-sm text-slate-500">No hay recomendaciones pendientes. ¡Excelente trabajo!</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-300">Evolución del CyberScore (90 días)</h2>
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                  <ReferenceLine y={80} stroke="#34d399" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" name="CyberScore" stroke={band.hex} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">Alertas recientes</h2>
              <Link to={`/c/${clientId}/alertas`} className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">Todas <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="divide-y divide-slate-800">
              {[...alerts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4).map(a => (
                <Link key={a.id} to={`/c/${clientId}/alertas?id=${a.id}`} className="flex items-center gap-3 py-2.5">
                  <Badge cls={SEVERITY[a.severity].cls}>{SEVERITY[a.severity].label}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.title}</span>
                  <span className="hidden text-xs text-slate-500 sm:inline">{timeAgo(a.createdAt, now)}</span>
                  <Badge cls={ALERT_STATUS[a.status].cls}>{ALERT_STATUS[a.status].label}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
