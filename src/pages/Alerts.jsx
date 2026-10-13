import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Search, Zap, ShieldOff, CheckCircle2, XCircle, UserCheck, Send, Brain, Monitor, Clock } from 'lucide-react'
import { useStore } from '../store'
import { Badge, Empty, Modal, PageHeader } from '../components/ui'
import { ALERT_STATUS, SEVERITY, dateTime, timeAgo } from '../lib/format'

function responseInfo(a, now) {
  const mins = Math.round(((a.firstResponseAt || now) - a.createdAt) / 60000)
  const slaOk = a.severity !== 'critica' || mins < 30
  return { mins, pending: !a.firstResponseAt, slaOk }
}

export default function Alerts() {
  const { clientId } = useParams()
  const [params, setParams] = useSearchParams()
  const { state, user, now, simulateAttack } = useStore()
  const [q, setQ] = useState('')
  const [sev, setSev] = useState('')
  const [status, setStatus] = useState('abiertas')
  const isSoc = user.role === 'soc'

  const list = useMemo(() => state.alerts
    .filter(a => !clientId || a.clientId === clientId)
    .filter(a => !sev || a.severity === sev)
    .filter(a => status === 'todas' || (status === 'abiertas' ? !['resuelta', 'falso_positivo'].includes(a.status) : a.status === status))
    .filter(a => !q || `${a.title} ${a.description} ${a.id}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order || b.createdAt - a.createdAt),
  [state.alerts, clientId, sev, status, q])

  const selected = state.alerts.find(a => a.id === params.get('id'))
  const client = clientId && state.clients.find(c => c.id === clientId)

  return (
    <div>
      <PageHeader title={clientId ? 'Alertas e incidentes' : 'Cola de alertas del SOC'}
        subtitle={clientId ? `Eventos detectados en ${client?.name}` : 'Todas las alertas de todos los clientes, priorizadas por severidad.'}>
        {isSoc && clientId && <button className="btn-danger" onClick={() => simulateAttack(clientId)}><Zap className="h-4 w-4" /> Simular ataque</button>}
      </PageHeader>

      <div className="card mb-4 flex flex-wrap gap-3 p-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input className="input pl-9" placeholder="Buscar alerta…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={sev} onChange={e => setSev(e.target.value)}>
          <option value="">Todas las severidades</option>
          {Object.entries(SEVERITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="abiertas">Abiertas</option>
          <option value="todas">Todas</option>
          {Object.entries(ALERT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="th">Severidad</th><th className="th">Alerta</th>{!clientId && <th className="th">Cliente</th>}<th className="th">Fuente</th><th className="th">Detectada</th><th className="th">1.ª respuesta</th><th className="th">Estado</th>
          </tr></thead>
          <tbody>
            {list.map(a => {
              const r = responseInfo(a, now)
              return (
                <tr key={a.id} className="cursor-pointer border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30" onClick={() => setParams({ id: a.id })}>
                  <td className="td"><Badge cls={SEVERITY[a.severity].cls}>{SEVERITY[a.severity].label}</Badge></td>
                  <td className="td"><div className="font-medium text-slate-200">{a.title}</div><div className="text-xs text-slate-500">{a.id} · {a.mitre}</div></td>
                  {!clientId && <td className="td text-slate-300">{state.clients.find(c => c.id === a.clientId)?.name}</td>}
                  <td className="td text-slate-400">{a.source}</td>
                  <td className="td whitespace-nowrap text-slate-400">{timeAgo(a.createdAt, now)}</td>
                  <td className="td whitespace-nowrap">
                    {r.pending ? <span className={r.slaOk ? 'text-amber-300' : 'font-semibold text-rose-400'}>Esperando · {r.mins} min</span>
                      : <span className={r.slaOk ? 'text-emerald-400' : 'text-rose-400'}>{r.mins} min</span>}
                  </td>
                  <td className="td"><Badge cls={ALERT_STATUS[a.status].cls}>{ALERT_STATUS[a.status].label}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!list.length && <Empty>No hay alertas con estos filtros.</Empty>}
      </div>

      {selected && <AlertDetail alert={selected} onClose={() => setParams({})} />}
    </div>
  )
}

function AlertDetail({ alert: a, onClose }) {
  const { state, user, now, takeAlert, setAlertStatus, isolateEndpoint, releaseEndpoint, addNote } = useStore()
  const [note, setNote] = useState('')
  const ep = a.endpointId && state.endpoints.find(e => e.id === a.endpointId)
  const client = state.clients.find(c => c.id === a.clientId)
  const isSoc = user.role === 'soc'
  const closed = ['resuelta', 'falso_positivo'].includes(a.status)
  const r = responseInfo(a, now)

  return (
    <Modal open onClose={onClose} title={a.title}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge cls={SEVERITY[a.severity].cls}>{SEVERITY[a.severity].label}</Badge>
        <Badge cls={ALERT_STATUS[a.status].cls}>{ALERT_STATUS[a.status].label}</Badge>
        <Badge cls="bg-slate-500/15 text-slate-300 ring-slate-500/30">{a.source}</Badge>
        {a.simulated && <Badge cls="bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30">Simulación</Badge>}
      </div>
      <p className="text-sm text-slate-300">{a.description}</p>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-slate-800/50 p-3"><div className="text-xs text-slate-500">Cliente</div><div className="text-slate-200">{client?.name}</div></div>
        <div className="rounded-lg bg-slate-800/50 p-3"><div className="text-xs text-slate-500">Técnica MITRE ATT&CK</div><div className="text-slate-200">{a.mitre}</div></div>
        <div className="rounded-lg bg-slate-800/50 p-3"><div className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> Detectada</div><div className="text-slate-200">{dateTime(a.createdAt)}</div></div>
        <div className="rounded-lg bg-slate-800/50 p-3"><div className="text-xs text-slate-500">Primera respuesta {a.severity === 'critica' && '(SLA < 30 min)'}</div>
          <div className={!r.slaOk ? 'text-rose-400' : r.pending ? 'text-amber-300' : 'text-emerald-400'}>{r.pending ? `Pendiente (${r.mins} min)` : `${r.mins} min`}</div></div>
        <div className="rounded-lg bg-slate-800/50 p-3 sm:col-span-2">
          <div className="flex items-center gap-1 text-xs text-slate-500"><Brain className="h-3 w-3" /> Confianza del modelo de detección de anomalías</div>
          <div className="mt-1 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-cyan-400" style={{ width: `${a.aiConfidence}%` }} /></div><span className="text-slate-200">{a.aiConfidence} %</span></div>
          <div className="mt-1 text-[11px] text-slate-500">La IA sólo prioriza; la decisión final la toma un analista humano.</div>
        </div>
        {ep && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 p-3 sm:col-span-2">
            <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-slate-400" /><div><div className="text-slate-200">{ep.hostname}</div><div className="text-xs text-slate-500">{ep.area} · {ep.os} · {ep.ip}</div></div></div>
            {isSoc && (ep.agent === 'aislado'
              ? <button className="btn-ghost" onClick={() => releaseEndpoint(ep.id)}>Liberar equipo</button>
              : <button className="btn-danger" onClick={() => isolateEndpoint(ep.id, a.id)}><ShieldOff className="h-4 w-4" /> Aislar equipo</button>)}
            {!isSoc && ep.agent === 'aislado' && <Badge cls="bg-violet-500/15 text-violet-300 ring-violet-500/30">Aislado por el SOC</Badge>}
          </div>
        )}
      </div>

      {isSoc && (
        <div className="mt-5 flex flex-wrap gap-2">
          {a.status === 'nueva' && <button className="btn-primary" onClick={() => takeAlert(a.id)}><UserCheck className="h-4 w-4" /> Tomar alerta</button>}
          {!closed && a.status !== 'escalada' && <button className="btn-ghost" onClick={() => setAlertStatus(a.id, 'escalada')}><Send className="h-4 w-4" /> Escalar al cliente</button>}
          {!closed && <button className="btn-ok" onClick={() => setAlertStatus(a.id, 'resuelta')}><CheckCircle2 className="h-4 w-4" /> Resolver</button>}
          {!closed && <button className="btn-ghost" onClick={() => setAlertStatus(a.id, 'falso_positivo')}><XCircle className="h-4 w-4" /> Falso positivo</button>}
          {closed && <button className="btn-ghost" onClick={() => setAlertStatus(a.id, 'en_analisis')}>Reabrir</button>}
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Notas y comunicación</h3>
        <div className="space-y-2">
          {a.notes.map((n, i) => (
            <div key={i} className="rounded-lg bg-slate-800/50 p-3 text-sm"><div className="text-xs text-slate-500">{n.author} · {dateTime(n.at)}</div><div className="text-slate-300">{n.text}</div></div>
          ))}
          {!a.notes.length && <p className="text-xs text-slate-500">Sin notas todavía.</p>}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); if (note.trim()) { addNote(a.id, note.trim()); setNote('') } }}>
          <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder={isSoc ? 'Agregar nota del analista…' : 'Escribir al equipo SOC…'} />
          <button className="btn-primary">Enviar</button>
        </form>
      </div>
    </Modal>
  )
}
