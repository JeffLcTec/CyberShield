import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { buildSeed, USERS } from './data/seed'

const KEY = 'cybershield-mvp-v1'
const SESSION = 'cybershield-session'
const Ctx = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignorar */ }
  return buildSeed()
}

const SIMULATIONS = [
  { title: 'Posible ransomware: cifrado masivo de archivos', description: 'Proceso desconocido renombró cientos de archivos en pocos segundos.', severity: 'critica', source: 'EDR', mitre: 'T1486 · Data Encrypted for Impact', ai: 93 },
  { title: 'Volcado de credenciales (LSASS)', description: 'Un proceso intentó leer la memoria de LSASS para extraer contraseñas.', severity: 'critica', source: 'EDR', mitre: 'T1003.001 · LSASS Memory', ai: 90 },
  { title: 'Inicio de sesión imposible por distancia', description: 'La misma cuenta inició sesión desde Costa Rica y Rusia con 8 minutos de diferencia.', severity: 'alta', source: 'SIEM', mitre: 'T1078 · Valid Accounts', ai: 85 },
  { title: 'Campaña de phishing detectada', description: 'Correos suplantando a Hacienda (ATV) con adjunto malicioso.', severity: 'media', source: 'Correo', mitre: 'T1566.001 · Spearphishing Attachment', ai: 79 },
  { title: 'Macro sospechosa en documento de Excel', description: 'Una macro intentó descargar un ejecutable desde Internet.', severity: 'alta', source: 'EDR', mitre: 'T1204.002 · Malicious File', ai: 82 },
]

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [user, setUser] = useState(() => {
    try { const id = sessionStorage.getItem(SESSION); return USERS.find(u => u.id === id) || null } catch { return null }
  })
  const [now, setNow] = useState(Date.now())

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignorar */ } }, [state])
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])

  const log = (s, clientId, action) => ({
    ...s, log: [{ id: 'l-' + Date.now() + Math.random(), at: Date.now(), actor: user?.name || 'Sistema', clientId, action }, ...s.log],
  })

  const update = useCallback(fn => setState(s => fn(structuredClone(s))), [])

  const actions = {
    login(email, password) {
      const u = USERS.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!u) return false
      setUser(u)
      try { sessionStorage.setItem(SESSION, u.id) } catch { /* ignorar */ }
      return true
    },
    logout() { setUser(null); try { sessionStorage.removeItem(SESSION) } catch { /* ignorar */ } },
    reset() { setState(buildSeed()) },

    takeAlert(id) {
      update(s => {
        const a = s.alerts.find(x => x.id === id)
        a.status = 'en_analisis'
        a.firstResponseAt ??= Date.now()
        return log(s, a.clientId, `Tomó la alerta ${a.id}: ${a.title}`)
      })
    },
    setAlertStatus(id, status) {
      update(s => {
        const a = s.alerts.find(x => x.id === id)
        a.status = status
        a.firstResponseAt ??= Date.now()
        if (status === 'resuelta' || status === 'falso_positivo') a.resolvedAt = Date.now()
        const verb = { resuelta: 'Resolvió', falso_positivo: 'Marcó como falso positivo', escalada: 'Escaló al cliente', en_analisis: 'Reabrió' }[status]
        return log(s, a.clientId, `${verb} la alerta ${a.id}: ${a.title}`)
      })
    },
    addNote(id, text) {
      update(s => {
        const a = s.alerts.find(x => x.id === id)
        a.notes.push({ at: Date.now(), author: user?.name, text })
        return s
      })
    },
    isolateEndpoint(id, alertId) {
      update(s => {
        const e = s.endpoints.find(x => x.id === id)
        e.prevAgent = e.agent
        e.agent = 'aislado'
        if (alertId) {
          const a = s.alerts.find(x => x.id === alertId)
          a.firstResponseAt ??= Date.now()
          if (a.status === 'nueva') a.status = 'en_analisis'
          a.notes.push({ at: Date.now(), author: user?.name, text: `Respuesta automática: equipo ${e.hostname} aislado de la red.` })
        }
        return log(s, e.clientId, `Aisló el equipo ${e.hostname} de la red`)
      })
    },
    releaseEndpoint(id) {
      update(s => {
        const e = s.endpoints.find(x => x.id === id)
        e.agent = e.prevAgent && e.prevAgent !== 'aislado' ? e.prevAgent : 'protegido'
        delete e.prevAgent
        return log(s, e.clientId, `Liberó el equipo ${e.hostname} (vuelve a la red)`)
      })
    },
    deployAgent(id) {
      update(s => {
        const e = s.endpoints.find(x => x.id === id)
        e.agent = 'protegido'
        e.agentVersion = '5.1.0'
        e.lastSeen = Date.now()
        return log(s, e.clientId, `Instaló/actualizó el agente EDR en ${e.hostname}`)
      })
    },
    setVulnStatus(id, status) {
      update(s => {
        const v = s.vulns.find(x => x.id === id)
        v.status = status
        const verb = { remediada: 'Marcó como remediada', aceptada: 'Aceptó el riesgo de', abierta: 'Reabrió' }[status]
        return log(s, v.clientId, `${verb} ${v.cve}: ${v.title}`)
      })
    },
    runScan(clientId) {
      update(s => {
        const c = s.clients.find(x => x.id === clientId)
        c.lastScan = Date.now()
        return log(s, clientId, 'Ejecutó escaneo de vulnerabilidades autorizado (ventana de mantenimiento acordada)')
      })
    },
    toggleMfa(id) {
      update(s => {
        const a = s.accounts.find(x => x.id === id)
        a.mfa = !a.mfa
        return log(s, a.clientId, `${a.mfa ? 'Activó' : 'Desactivó'} MFA en ${a.name} (${a.system})`)
      })
    },
    setEmail(clientId, key, value) {
      update(s => {
        const c = s.clients.find(x => x.id === clientId)
        c.email[key] = value
        return log(s, clientId, `${value ? 'Configuró' : 'Retiró'} ${key.toUpperCase()} en ${c.email.domain}`)
      })
    },
    setBackup(clientId, patch, label) {
      update(s => {
        const c = s.clients.find(x => x.id === clientId)
        Object.assign(c.backup, patch)
        return log(s, clientId, label)
      })
    },
    simulateAttack(clientId) {
      update(s => {
        const tpl = SIMULATIONS[Math.floor(Math.random() * SIMULATIONS.length)]
        const eps = s.endpoints.filter(e => e.clientId === clientId && e.agent !== 'sin_agente' && e.agent !== 'aislado')
        const ep = tpl.source === 'EDR' && eps.length ? eps[Math.floor(Math.random() * eps.length)] : null
        const id = 'a-' + (1000 + s.alerts.length + Math.floor(Math.random() * 900))
        s.alerts.unshift({
          id, clientId, title: tpl.title, description: tpl.description, severity: tpl.severity, source: tpl.source,
          mitre: tpl.mitre, aiConfidence: tpl.ai, endpointId: ep?.id || null, createdAt: Date.now(),
          firstResponseAt: null, resolvedAt: null, status: 'nueva', notes: [], simulated: true,
        })
        return log(s, clientId, `Simulación: se generó la alerta ${id} (${tpl.title})`)
      })
    },
    addEndpoint(clientId, data) {
      update(s => {
        const n = s.endpoints.filter(e => e.clientId === clientId).length
        s.endpoints.push({
          id: `${clientId}-ep-${Date.now()}`, clientId, ...data, agent: 'sin_agente', agentVersion: null, lastSeen: null,
          ip: `10.99.1.${20 + n}`,
        })
        return log(s, clientId, `Registró el equipo ${data.hostname} en el inventario`)
      })
    },
    addClient(data) {
      update(s => {
        const id = 'c-' + Date.now()
        s.clients.push({
          id, ...data, status: 'piloto', since: Date.now(), employees: Number(data.employees) || 10,
          email: { domain: data.domain, spf: false, dkim: false, dmarc: false },
          backup: { lastHours: 168, frequency: 'Sin definir', tested: false, offsite: false },
        })
        s.histories[id] = []
        return log(s, id, `Registró al cliente ${data.name} (plan ${data.plan})`)
      })
    },
  }

  return <Ctx.Provider value={{ state, user, now, ...actions }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
