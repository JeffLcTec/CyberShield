// CyberScore v1 (0–100), según el Módulo 9.2:
// cobertura EDR 25 %, parches y vulnerabilidades críticas 25 %,
// MFA y control de accesos 20 %, correo SPF/DKIM/DMARC 15 %, respaldos 15 %.

export const FACTORS = [
  { key: 'edr', label: 'Cobertura del EDR', weight: 25, plain: '¿Todos los equipos tienen protección activa?' },
  { key: 'patches', label: 'Parches y vulnerabilidades', weight: 25, plain: '¿Hay fallas graves sin corregir?' },
  { key: 'mfa', label: 'MFA y control de accesos', weight: 20, plain: '¿Las cuentas importantes piden doble verificación?' },
  { key: 'email', label: 'Correo SPF/DKIM/DMARC', weight: 15, plain: '¿Pueden suplantar el correo de la empresa?' },
  { key: 'backup', label: 'Respaldos', weight: 15, plain: '¿Se podría recuperar la información tras un ataque?' },
]

const clamp = v => Math.max(0, Math.min(100, Math.round(v)))

export function computeFactors(state, clientId) {
  const client = state.clients.find(c => c.id === clientId)
  const eps = state.endpoints.filter(e => e.clientId === clientId)
  const vulns = state.vulns.filter(v => v.clientId === clientId && v.status === 'abierta')
  const accs = state.accounts.filter(a => a.clientId === clientId)

  // EDR: agente al día cuenta completo, desactualizado medio punto, aislado cuenta (está contenido)
  const edrPts = eps.reduce((s, e) => s + (e.agent === 'protegido' || e.agent === 'aislado' ? 1 : e.agent === 'desactualizado' ? 0.5 : 0), 0)
  const edr = eps.length ? (edrPts / eps.length) * 100 : 0

  const count = sev => vulns.filter(v => v.severity === sev).length
  const patches = 100 - count('critica') * 22 - count('alta') * 10 - count('media') * 4 - count('baja') * 1

  // Cuentas privilegiadas pesan el doble
  const totalW = accs.reduce((s, a) => s + (a.privileged ? 2 : 1), 0)
  const mfaW = accs.reduce((s, a) => s + (a.mfa ? (a.privileged ? 2 : 1) : 0), 0)
  const mfa = totalW ? (mfaW / totalW) * 100 : 0

  const em = client.email
  const email = (em.spf ? 30 : 0) + (em.dkim ? 30 : 0) + (em.dmarc ? 40 : 0)

  const b = client.backup
  const backup = (b.lastHours <= 24 ? 40 : b.lastHours <= 72 ? 20 : 0) + (b.tested ? 30 : 0) + (b.offsite ? 30 : 0)

  return { edr: clamp(edr), patches: clamp(patches), mfa: clamp(mfa), email: clamp(email), backup: clamp(backup) }
}

export function computeScore(state, clientId) {
  const f = computeFactors(state, clientId)
  return Math.round(FACTORS.reduce((s, x) => s + (f[x.key] * x.weight) / 100, 0))
}

export function scoreBand(score) {
  if (score >= 80) return { label: 'Riesgo bajo', color: 'text-emerald-400', hex: '#34d399', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' }
  if (score >= 60) return { label: 'Riesgo moderado', color: 'text-amber-300', hex: '#fcd34d', bg: 'bg-amber-500/15', ring: 'ring-amber-500/30' }
  if (score >= 40) return { label: 'Riesgo alto', color: 'text-orange-400', hex: '#fb923c', bg: 'bg-orange-500/15', ring: 'ring-orange-500/30' }
  return { label: 'Riesgo crítico', color: 'text-rose-400', hex: '#fb7185', bg: 'bg-rose-500/15', ring: 'ring-rose-500/30' }
}

// Recomendaciones priorizadas en lenguaje de gerencia, con el impacto estimado en el CyberScore
export function recommendations(state, clientId) {
  const recs = []
  const eps = state.endpoints.filter(e => e.clientId === clientId)
  const vulns = state.vulns.filter(v => v.clientId === clientId && v.status === 'abierta')
  const accs = state.accounts.filter(a => a.clientId === clientId)
  const client = state.clients.find(c => c.id === clientId)
  const base = computeScore(state, clientId)

  const gain = mutate => {
    const copy = structuredClone(state)
    mutate(copy)
    return computeScore(copy, clientId) - base
  }

  const crit = vulns.filter(v => v.severity === 'critica')
  if (crit.length) recs.push({
    id: 'crit', area: 'patches', title: `Corregir ${crit.length} falla(s) crítica(s)`,
    detail: crit.map(v => `${v.title} (${v.asset})`).join('; '),
    gain: gain(s => s.vulns.forEach(v => { if (v.clientId === clientId && v.severity === 'critica' && v.status === 'abierta') v.status = 'remediada' })),
  })
  const noAgent = eps.filter(e => e.agent === 'sin_agente' || e.agent === 'desactualizado')
  if (noAgent.length) recs.push({
    id: 'edr', area: 'edr', title: `Proteger ${noAgent.length} equipo(s) sin agente o desactualizados`,
    detail: noAgent.map(e => `${e.hostname} (${e.area})`).join(', '),
    gain: gain(s => s.endpoints.forEach(e => { if (e.clientId === clientId && e.agent !== 'aislado') e.agent = 'protegido' })),
  })
  const noMfa = accs.filter(a => !a.mfa)
  if (noMfa.length) recs.push({
    id: 'mfa', area: 'mfa', title: `Activar doble verificación (MFA) en ${noMfa.length} cuenta(s)`,
    detail: noMfa.map(a => `${a.name} · ${a.system}`).join(', '),
    gain: gain(s => s.accounts.forEach(a => { if (a.clientId === clientId) a.mfa = true })),
  })
  const em = client.email
  if (!em.spf || !em.dkim || !em.dmarc) recs.push({
    id: 'email', area: 'email', title: 'Completar la protección del correo contra suplantación',
    detail: `Falta configurar: ${[!em.spf && 'SPF', !em.dkim && 'DKIM', !em.dmarc && 'DMARC'].filter(Boolean).join(', ')} en ${em.domain}`,
    gain: gain(s => { const c = s.clients.find(x => x.id === clientId); c.email = { ...c.email, spf: true, dkim: true, dmarc: true } }),
  })
  const b = client.backup
  if (b.lastHours > 24 || !b.tested || !b.offsite) recs.push({
    id: 'backup', area: 'backup', title: 'Fortalecer los respaldos',
    detail: [b.lastHours > 24 && 'respaldar al menos una vez al día', !b.tested && 'probar una restauración', !b.offsite && 'guardar una copia fuera de la oficina'].filter(Boolean).join(', '),
    gain: gain(s => { const c = s.clients.find(x => x.id === clientId); c.backup = { ...c.backup, lastHours: 12, tested: true, offsite: true } }),
  })
  return recs.sort((a, b) => b.gain - a.gain)
}
