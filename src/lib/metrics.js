import { computeScore } from './score'

// Métricas de éxito del MVP (Módulo 9.4)
export function mvpMetrics(state, clientId) {
  const inScope = x => !clientId || x.clientId === clientId
  const eps = state.endpoints.filter(inScope)
  const alerts = state.alerts.filter(inScope)
  const clients = state.clients.filter(c => !clientId || c.id === clientId)

  const coverage = eps.length ? (eps.filter(e => e.agent !== 'sin_agente').length / eps.length) * 100 : 0

  const crit = alerts.filter(a => a.severity === 'critica' && a.firstResponseAt)
  const avgCritResponse = crit.length ? crit.reduce((s, a) => s + (a.firstResponseAt - a.createdAt), 0) / crit.length / 60000 : null

  const closed = alerts.filter(a => a.status === 'resuelta' || a.status === 'falso_positivo')
  const fpRate = closed.length ? (closed.filter(a => a.status === 'falso_positivo').length / closed.length) * 100 : 0

  const deltas = clients.filter(c => state.histories[c.id]?.length).map(c => computeScore(state, c.id) - state.histories[c.id][0])
  const avgDelta = deltas.length ? deltas.reduce((s, d) => s + d, 0) / deltas.length : 0

  return { coverage, avgCritResponse, fpRate, avgDelta }
}
