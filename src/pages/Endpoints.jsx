import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, ShieldOff, ShieldCheck, Plus, Search } from 'lucide-react'
import { useStore } from '../store'
import { Badge, Empty, Modal, PageHeader, Stat, Bar } from '../components/ui'
import { AGENT, timeAgo } from '../lib/format'
import { computeFactors } from '../lib/score'

export default function Endpoints() {
  const { clientId } = useParams()
  const { state, user, now, isolateEndpoint, releaseEndpoint, deployAgent, addEndpoint } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ hostname: '', area: '', os: 'Windows 11' })
  const isSoc = user.role === 'soc'
  const eps = state.endpoints.filter(e => e.clientId === clientId)
  const list = eps.filter(e => (!filter || e.agent === filter) && (!q || `${e.hostname} ${e.area} ${e.os}`.toLowerCase().includes(q.toLowerCase())))
  const coverage = eps.length ? Math.round((eps.filter(e => e.agent !== 'sin_agente').length / eps.length) * 100) : 0
  const vulnsByAsset = h => state.vulns.filter(v => v.clientId === clientId && v.asset === h && v.status === 'abierta').length

  return (
    <div>
      <PageHeader title="Equipos protegidos (EDR)" subtitle="Inventario de equipos con el agente de detección y respuesta gestionado por CyberShield.">
        {isSoc && <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Registrar equipo</button>}
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Cobertura del agente</div>
          <div className="mt-2 text-2xl font-semibold text-white">{coverage} %</div>
          <div className="mt-2"><Bar value={coverage} /></div>
          <div className={`mt-1 text-xs ${coverage >= 95 ? 'text-emerald-400' : 'text-rose-400'}`}>Meta del MVP: ≥ 95 %</div>
        </div>
        {Object.entries(AGENT).map(([k, v]) => (
          k !== 'protegido' && <Stat key={k} label={v.label} value={eps.filter(e => e.agent === k).length} />
        ))}
      </div>

      <div className="card mb-4 flex flex-wrap gap-3 p-3">
        <div className="relative min-w-48 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input className="input pl-9" placeholder="Buscar equipo…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(AGENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex items-center text-xs text-slate-500">Factor EDR del CyberScore: <span className="ml-1 font-semibold text-slate-200">{computeFactors(state, clientId).edr}/100</span></div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800"><th className="th">Equipo</th><th className="th">Sistema</th><th className="th">Agente</th><th className="th">Último reporte</th><th className="th">Vulns.</th>{isSoc && <th className="th text-right">Acciones</th>}</tr></thead>
          <tbody>
            {list.map(e => (
              <tr key={e.id} className="border-b border-slate-800/60 last:border-0">
                <td className="td"><div className="font-medium text-slate-200">{e.hostname}</div><div className="text-xs text-slate-500">{e.area} · {e.ip}</div></td>
                <td className="td text-slate-400">{e.os}</td>
                <td className="td"><Badge cls={AGENT[e.agent].cls}>{AGENT[e.agent].label}</Badge>{e.agentVersion && <div className="mt-1 text-[11px] text-slate-500">v{e.agentVersion}</div>}</td>
                <td className="td text-slate-400">{e.agent === 'sin_agente' ? '—' : timeAgo(e.lastSeen, now)}</td>
                <td className="td">{vulnsByAsset(e.hostname) ? <span className="font-semibold text-orange-300">{vulnsByAsset(e.hostname)}</span> : <span className="text-slate-500">0</span>}</td>
                {isSoc && (
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      {(e.agent === 'sin_agente' || e.agent === 'desactualizado') && <button className="btn-ok py-1" onClick={() => deployAgent(e.id)}><Download className="h-3.5 w-3.5" />{e.agent === 'sin_agente' ? 'Instalar agente' : 'Actualizar'}</button>}
                      {e.agent === 'aislado' && <button className="btn-ghost py-1" onClick={() => releaseEndpoint(e.id)}><ShieldCheck className="h-3.5 w-3.5" /> Liberar</button>}
                      {(e.agent === 'protegido' || e.agent === 'desactualizado') && <button className="btn-danger py-1" onClick={() => { if (confirm(`¿Aislar ${e.hostname} de la red? El equipo perderá conectividad excepto con la consola de CyberShield.`)) isolateEndpoint(e.id) }}><ShieldOff className="h-3.5 w-3.5" /> Aislar</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty>No hay equipos registrados.</Empty>}
      </div>
      <p className="mt-3 text-xs text-slate-500">Privacidad: el agente recolecta únicamente metadatos y telemetría técnica (procesos, conexiones, archivos ejecutables), no el contenido de documentos ni correos (Ley N.º 8968).</p>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar equipo en el inventario">
        <form className="grid gap-4 sm:grid-cols-3" onSubmit={ev => { ev.preventDefault(); addEndpoint(clientId, form); setForm({ hostname: '', area: '', os: 'Windows 11' }); setOpen(false) }}>
          <label><span className="mb-1 block text-xs text-slate-400">Nombre del equipo</span><input className="input" required value={form.hostname} onChange={e => setForm({ ...form, hostname: e.target.value.toUpperCase() })} placeholder="ABC-REC-01" /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Área</span><input className="input" required value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Recepción" /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Sistema operativo</span>
            <select className="input" value={form.os} onChange={e => setForm({ ...form, os: e.target.value })}>{['Windows 11', 'Windows 10', 'Windows Server 2022', 'macOS 15', 'Ubuntu 24.04'].map(o => <option key={o}>{o}</option>)}</select></label>
          <div className="flex justify-end gap-2 sm:col-span-3"><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button><button className="btn-primary">Registrar</button></div>
        </form>
      </Modal>
    </div>
  )
}
