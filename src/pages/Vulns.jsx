import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ScanLine, Check, RotateCcw, FileSignature } from 'lucide-react'
import { useStore } from '../store'
import { Badge, Empty, PageHeader, Stat } from '../components/ui'
import { SEVERITY, date, timeAgo } from '../lib/format'
import { computeFactors } from '../lib/score'

const STATUS = {
  abierta: { label: 'Abierta', cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/30' },
  remediada: { label: 'Remediada', cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  aceptada: { label: 'Riesgo aceptado', cls: 'bg-slate-500/15 text-slate-300 ring-slate-500/30' },
}

export default function Vulns() {
  const { clientId } = useParams()
  const { state, user, now, setVulnStatus, runScan } = useStore()
  const [tab, setTab] = useState('abierta')
  const [scanning, setScanning] = useState(false)
  const isSoc = user.role === 'soc'
  const client = state.clients.find(c => c.id === clientId)
  const all = state.vulns.filter(v => v.clientId === clientId)
  const list = all.filter(v => v.status === tab).sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order || b.cvss - a.cvss)
  const open = all.filter(v => v.status === 'abierta')
  const lastScan = client.lastScan || Math.max(0, ...all.map(v => v.detectedAt))

  const scan = () => { setScanning(true); setTimeout(() => { runScan(clientId); setScanning(false) }, 2200) }

  return (
    <div>
      <PageHeader title="Análisis de vulnerabilidades" subtitle="Resultado del escaneo mensual autorizado por contrato, con ventana de mantenimiento acordada.">
        {isSoc && <button className="btn-primary" onClick={scan} disabled={scanning}><ScanLine className={`h-4 w-4 ${scanning ? 'animate-pulse' : ''}`} />{scanning ? 'Escaneando…' : 'Ejecutar escaneo'}</button>}
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(SEVERITY).map(([k, v]) => <Stat key={k} label={v.label} value={open.filter(x => x.severity === k).length} hint="abiertas" />)}
        <Stat label="Factor parches" value={`${computeFactors(state, clientId).patches}/100`} hint={lastScan ? `Último escaneo ${timeAgo(lastScan, now)}` : 'Sin escaneos'} />
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-200">
        <FileSignature className="h-4 w-4 shrink-0" /> Autorización escrita de escaneo vigente firmada digitalmente por {client.contact} (Ley N.º 8454 y Ley N.º 9048). Sin autorización no se ejecutan pruebas.
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 text-sm">
        {Object.entries(STATUS).map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-md px-3 py-1.5 transition ${tab === k ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {v.label} <span className="text-xs text-slate-500">({all.filter(x => x.status === k).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map(v => (
          <div key={v.id} className="card p-4">
            <div className="flex flex-wrap items-start gap-3">
              <Badge cls={SEVERITY[v.severity].cls}>{SEVERITY[v.severity].label} · {v.cvss}</Badge>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-200">{v.title}</div>
                <div className="text-xs text-slate-500">{v.cve} · Activo: {v.asset} · Detectada el {date(v.detectedAt)}</div>
                <div className="mt-2 text-sm text-slate-400"><span className="text-slate-300">Cómo corregir:</span> {v.fix}</div>
              </div>
              <Badge cls={STATUS[v.status].cls}>{STATUS[v.status].label}</Badge>
            </div>
            {isSoc && (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {v.status === 'abierta' && <>
                  <button className="btn-ghost py-1 text-xs" onClick={() => setVulnStatus(v.id, 'aceptada')}>Aceptar riesgo</button>
                  <button className="btn-ok py-1 text-xs" onClick={() => setVulnStatus(v.id, 'remediada')}><Check className="h-3.5 w-3.5" /> Marcar remediada</button>
                </>}
                {v.status !== 'abierta' && <button className="btn-ghost py-1 text-xs" onClick={() => setVulnStatus(v.id, 'abierta')}><RotateCcw className="h-3.5 w-3.5" /> Reabrir</button>}
              </div>
            )}
          </div>
        ))}
        {!list.length && <div className="card"><Empty>No hay vulnerabilidades en esta categoría.</Empty></div>}
      </div>
    </div>
  )
}
