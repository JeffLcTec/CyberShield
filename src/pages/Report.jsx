import { useParams } from 'react-router-dom'
import { Printer, Shield } from 'lucide-react'
import { useStore } from '../store'
import { computeFactors, computeScore, FACTORS, recommendations, scoreBand } from '../lib/score'
import { mvpMetrics } from '../lib/metrics'
import { Bar, PageHeader, ScoreGauge } from '../components/ui'
import { SEVERITY, date } from '../lib/format'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default function Report() {
  const { clientId } = useParams()
  const { state, now } = useStore()
  const client = state.clients.find(c => c.id === clientId)
  const score = computeScore(state, clientId)
  const f = computeFactors(state, clientId)
  const band = scoreBand(score)
  const recs = recommendations(state, clientId).slice(0, 3)
  const m = mvpMetrics(state, clientId)
  const hist = state.histories[clientId] || []
  const prev = hist.length >= 5 ? hist[hist.length - 5] : hist[0]
  const month = new Date(now)
  const monthAgo = now - 30 * 24 * 3600 * 1000
  const alerts = state.alerts.filter(a => a.clientId === clientId && a.createdAt >= monthAgo)
  const handled = alerts.filter(a => a.status === 'resuelta').length
  const eps = state.endpoints.filter(e => e.clientId === clientId)
  const vulns = state.vulns.filter(v => v.clientId === clientId)

  return (
    <div>
      <PageHeader title="Reporte mensual" subtitle="Versión para gerencia, sin tecnicismos. Use «Descargar PDF» para guardarlo o imprimirlo.">
        <button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Descargar PDF</button>
      </PageHeader>

      <article className="print-area mx-auto max-w-4xl space-y-6">
        <header className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400"><Shield className="h-5 w-5 text-slate-950" /></div>
            <div><div className="text-lg font-semibold text-white">Reporte de seguridad · {MONTHS[month.getMonth()]} {month.getFullYear()}</div><div className="text-sm text-slate-400">{client.name} · {client.sector}</div></div>
          </div>
          <div className="text-right text-xs text-slate-500">Emitido el {date(now)}<br />Preparado por CyberShield S.R.L.</div>
        </header>

        <section className="card grid gap-6 p-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center"><ScoreGauge score={score} size={240} /></div>
          <div>
            <h2 className="mb-2 font-semibold text-white">En resumen</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Este mes su CyberScore es de <b className={band.color}>{score} puntos</b> ({band.label.toLowerCase()}),
              {prev != null && (score === prev ? <> igual que el mes anterior.</> : <> {score > prev ? 'una mejora' : 'una baja'} de <b>{Math.abs(score - prev)} puntos</b> respecto al mes anterior.</>)}
              {' '}Detectamos <b>{alerts.length} eventos</b> de seguridad, de los cuales <b>{handled}</b> fueron resueltos por nuestro equipo.
              Monitoreamos <b>{eps.length} equipos</b> con una cobertura del <b>{m.coverage.toFixed(0)} %</b>.
            </p>
            {m.avgCritResponse != null && <p className="mt-3 text-sm text-slate-400">Tiempo promedio de respuesta ante incidentes críticos: <b className="text-slate-200">{m.avgCritResponse.toFixed(0)} minutos</b> (compromiso: menos de 30).</p>}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-white">Los cinco controles que medimos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FACTORS.map(x => (
              <div key={x.key}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-slate-300">{x.label} <span className="text-xs text-slate-500">({x.weight} %)</span></span><b className="text-white">{f[x.key]}</b></div>
                <Bar value={f[x.key]} />
                <div className="mt-1 text-xs text-slate-500">{x.plain}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-white">Lo que recomendamos hacer este mes</h2>
          <ol className="space-y-3">
            {recs.map((r, i) => (
              <li key={r.id} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">{i + 1}</span>
                <div><div className="font-medium text-slate-200">{r.title} <span className="text-xs text-emerald-400">(+{r.gain} pts)</span></div><div className="text-xs text-slate-500">{r.detail}</div></div>
              </li>
            ))}
            {!recs.length && <li className="text-sm text-slate-400">No hay acciones pendientes.</li>}
          </ol>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-white">Incidentes del periodo</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800 text-left text-xs text-slate-500"><th className="py-2">Fecha</th><th>Evento</th><th>Severidad</th><th>Resultado</th></tr></thead>
            <tbody>
              {alerts.sort((a, b) => b.createdAt - a.createdAt).map(a => (
                <tr key={a.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="py-2 pr-2 text-slate-400">{new Date(a.createdAt).toLocaleDateString('es-CR')}</td>
                  <td className="pr-2 text-slate-300">{a.title}</td>
                  <td className="pr-2 text-slate-400">{SEVERITY[a.severity].label}</td>
                  <td className="text-slate-400">{{ nueva: 'En atención', en_analisis: 'En análisis', escalada: 'Requiere acción suya', resuelta: 'Resuelto', falso_positivo: 'Sin riesgo real' }[a.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">Vulnerabilidades: {vulns.filter(v => v.status === 'abierta').length} abiertas · {vulns.filter(v => v.status === 'remediada').length} corregidas · {vulns.filter(v => v.status === 'aceptada').length} con riesgo aceptado.</p>
        </section>

        <section className="card p-6 text-xs leading-relaxed text-slate-500">
          <h2 className="mb-2 text-sm font-semibold text-slate-300">Qué mide y qué no mide el CyberScore</h2>
          El CyberScore resume cinco controles básicos de seguridad y sirve para dar seguimiento mes a mes. No es una certificación ni garantiza que la empresa no sufrirá un incidente: ningún servicio ofrece un 100 % de protección.
          El monitoreo se limita a metadatos y telemetría técnica; este reporte no contiene información individual de colaboradores ni debe usarse con fines disciplinarios (Ley N.º 8968). Datos retenidos por 12 meses.
        </section>
      </article>
    </div>
  )
}
