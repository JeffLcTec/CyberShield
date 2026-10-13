import { useState } from 'react'
import { useStore } from '../store'
import { Empty, PageHeader } from '../components/ui'
import { dateTime } from '../lib/format'

export default function AuditLog() {
  const { state } = useStore()
  const [client, setClient] = useState('')
  const list = state.log.filter(l => !client || l.clientId === client)
  return (
    <div>
      <PageHeader title="Bitácora de acciones" subtitle="Registro inalterable de quién hizo qué y cuándo (trazabilidad exigida por la Ley N.º 9048 y la política interna).">
        <select className="input w-auto" value={client} onChange={e => setClient(e.target.value)}>
          <option value="">Todos los clientes</option>
          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </PageHeader>
      <div className="card divide-y divide-slate-800">
        {list.map(l => (
          <div key={l.id} className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <span className="w-44 shrink-0 text-xs text-slate-500">{dateTime(l.at)}</span>
            <span className="w-36 shrink-0 font-medium text-cyan-300">{l.actor}</span>
            <span className="w-40 shrink-0 text-slate-400">{state.clients.find(c => c.id === l.clientId)?.name}</span>
            <span className="min-w-0 flex-1 text-slate-300">{l.action}</span>
          </div>
        ))}
        {!list.length && <Empty>Sin acciones registradas.</Empty>}
      </div>
    </div>
  )
}
