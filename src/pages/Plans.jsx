import { useState } from 'react'
import { Check } from 'lucide-react'
import { PLANS } from '../data/seed'
import { PageHeader } from '../components/ui'
import { crc, usd } from '../lib/format'

export default function Plans() {
  const [counts, setCounts] = useState({ esencial: 27, profesional: 24, avanzado: 9 })
  const total = Object.values(counts).reduce((s, n) => s + Number(n || 0), 0)
  const mrr = PLANS.reduce((s, p) => s + p.crc * Number(counts[p.id] || 0), 0)
  const variable = total * 85000
  const fixedMonthly = (185236540 + 24660000 + 13320000 + 6000000 + 15600000) / 12
  const margin = mrr - variable - fixedMonthly

  return (
    <div>
      <PageHeader title="Planes y precios" subtitle="Suscripción mensual (precios sin IVA, tipo de cambio ₡500). Cuota única de implementación: ₡250.000." />
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map(p => (
          <div key={p.id} className={`card relative p-6 ${p.id === 'profesional' ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : ''}`}>
            {p.id === 'profesional' && <span className="absolute -top-3 left-6 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-semibold text-slate-950">Más elegido</span>}
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1"><span className="text-3xl font-bold text-white">{usd(p.usd)}</span><span className="text-sm text-slate-400">/mes</span></div>
            <div className="text-sm text-slate-500">{crc(p.crc)} · hasta {p.endpoints} equipos</div>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map(f => <li key={f} className="flex items-start gap-2 text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
            </ul>
            <div className="mt-5 text-xs text-slate-500">Mezcla esperada de clientes: {p.mix} %</div>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-white">Simulador de punto de equilibrio</h2>
        <p className="mb-4 text-xs text-slate-500">Basado en el presupuesto del año 1 (Módulo 8): costo fijo mensual ≈ {crc(fixedMonthly)} y ₡85.000 de costo variable por cliente.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map(p => (
            <label key={p.id}><span className="mb-1 block text-xs text-slate-400">Clientes {p.name}</span>
              <input type="range" min="0" max="60" value={counts[p.id]} onChange={e => setCounts({ ...counts, [p.id]: e.target.value })} className="w-full accent-cyan-400" />
              <span className="text-sm text-slate-200">{counts[p.id]}</span></label>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-800/50 p-4"><div className="text-xs text-slate-500">Clientes activos</div><div className="text-xl font-semibold text-white">{total}</div></div>
          <div className="rounded-lg bg-slate-800/50 p-4"><div className="text-xs text-slate-500">Ingreso mensual</div><div className="text-xl font-semibold text-white">{crc(mrr)}</div></div>
          <div className="rounded-lg bg-slate-800/50 p-4"><div className="text-xs text-slate-500">Costos del mes</div><div className="text-xl font-semibold text-white">{crc(variable + fixedMonthly)}</div></div>
          <div className={`rounded-lg p-4 ${margin >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}><div className="text-xs text-slate-500">EBITDA mensual</div><div className={`text-xl font-semibold ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{crc(margin)}</div></div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Carga del SOC: {(total / 3).toFixed(1)} clientes por analista {total / 3 > 20 ? '— supera el tope de 20: se debe contratar.' : '(tope: 20).'}</p>
      </div>
    </div>
  )
}
