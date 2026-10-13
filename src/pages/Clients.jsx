import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Users } from 'lucide-react'
import { useStore } from '../store'
import { computeScore } from '../lib/score'
import { PLANS } from '../data/seed'
import { Badge, Modal, PageHeader, ScoreGauge } from '../components/ui'
import { crc, date } from '../lib/format'

const EMPTY = { name: '', sector: 'Hotelería y turismo', location: '', plan: 'esencial', contact: '', employees: 20, domain: '' }

export default function Clients() {
  const { state, addClient } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader title="Clientes" subtitle="PYMEs costarricenses de 10 a 100 colaboradores sin área de seguridad propia.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo cliente</button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.clients.map(c => {
          const plan = PLANS.find(p => p.id === c.plan)
          const eps = state.endpoints.filter(e => e.clientId === c.id).length
          return (
            <Link key={c.id} to={`/c/${c.id}`} className="card group p-5 transition hover:border-cyan-500/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-300">{c.name}</h3>
                  <p className="text-xs text-slate-400">{c.sector}</p>
                </div>
                <Badge cls={c.status === 'piloto' ? 'bg-violet-500/15 text-violet-300 ring-violet-500/30' : 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'}>{c.status === 'piloto' ? 'Piloto' : 'Activo'}</Badge>
              </div>
              <div className="my-3"><ScoreGauge score={computeScore(state, c.id)} size={170} /></div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location || '—'}</div>
                <div className="flex items-center gap-1"><Users className="h-3 w-3" />{c.employees} colaboradores</div>
                <div>Plan <span className="text-slate-200">{plan?.name}</span> · {crc(plan?.crc || 0)}/mes</div>
                <div>{eps} equipos monitoreados</div>
                <div className="col-span-2">Cliente desde {date(c.since)}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar nuevo cliente (piloto)">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); addClient(form); setForm(EMPTY); setOpen(false) }}>
          <label className="sm:col-span-2"><span className="mb-1 block text-xs text-slate-400">Nombre de la empresa</span><input className="input" required value={form.name} onChange={set('name')} /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Sector</span>
            <select className="input" value={form.sector} onChange={set('sector')}>
              {['Hotelería y turismo', 'Salud privada', 'Despacho contable', 'Comercio electrónico', 'Logística', 'Desarrollo de software'].map(s => <option key={s}>{s}</option>)}
            </select></label>
          <label><span className="mb-1 block text-xs text-slate-400">Ubicación</span><input className="input" value={form.location} onChange={set('location')} placeholder="Cantón, provincia" /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Plan</span>
            <select className="input" value={form.plan} onChange={set('plan')}>{PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — {crc(p.crc)}/mes</option>)}</select></label>
          <label><span className="mb-1 block text-xs text-slate-400">Colaboradores</span><input className="input" type="number" min="1" value={form.employees} onChange={set('employees')} /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Persona de contacto</span><input className="input" value={form.contact} onChange={set('contact')} /></label>
          <label><span className="mb-1 block text-xs text-slate-400">Dominio de correo</span><input className="input" required value={form.domain} onChange={set('domain')} placeholder="empresa.cr" /></label>
          <p className="text-xs text-slate-500 sm:col-span-2">Al registrar se asume firmado el contrato, el aviso de privacidad (Ley 8968) y la autorización escrita de escaneo (Ley 9048). El cliente inicia sin agentes instalados, por lo que su CyberScore arranca bajo.</p>
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button><button className="btn-primary">Registrar</button></div>
        </form>
      </Modal>
    </div>
  )
}
