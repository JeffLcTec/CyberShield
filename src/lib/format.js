export const crc = n => '₡' + Math.round(n).toLocaleString('es-CR')
export const usd = n => '$' + n.toLocaleString('en-US')

export function timeAgo(ts, now = Date.now()) {
  if (!ts) return '—'
  const m = Math.round((now - ts) / 60000)
  if (m < 1) return 'hace segundos'
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

export const dateTime = ts => new Date(ts).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' })
export const date = ts => new Date(ts).toLocaleDateString('es-CR', { dateStyle: 'long' })

export const SEVERITY = {
  critica: { label: 'Crítica', cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/30', order: 0 },
  alta: { label: 'Alta', cls: 'bg-orange-500/15 text-orange-300 ring-orange-500/30', order: 1 },
  media: { label: 'Media', cls: 'bg-amber-500/15 text-amber-200 ring-amber-500/30', order: 2 },
  baja: { label: 'Baja', cls: 'bg-sky-500/15 text-sky-300 ring-sky-500/30', order: 3 },
}

export const ALERT_STATUS = {
  nueva: { label: 'Nueva', cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/30' },
  en_analisis: { label: 'En análisis', cls: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30' },
  escalada: { label: 'Escalada al cliente', cls: 'bg-violet-500/15 text-violet-300 ring-violet-500/30' },
  resuelta: { label: 'Resuelta', cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  falso_positivo: { label: 'Falso positivo', cls: 'bg-slate-500/15 text-slate-300 ring-slate-500/30' },
}

export const AGENT = {
  protegido: { label: 'Protegido', cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  desactualizado: { label: 'Agente desactualizado', cls: 'bg-amber-500/15 text-amber-200 ring-amber-500/30' },
  sin_agente: { label: 'Sin agente', cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/30' },
  aislado: { label: 'Aislado', cls: 'bg-violet-500/15 text-violet-300 ring-violet-500/30' },
}
