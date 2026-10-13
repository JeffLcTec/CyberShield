import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Activity, Gauge, FileText, Lock } from 'lucide-react'
import { useStore } from '../store'
import { USERS } from '../data/seed'

export default function Login() {
  const { login } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e, em = email, pw = password) => {
    e?.preventDefault()
    if (login(em, pw)) navigate('/')
    else setError('Correo o contraseña incorrectos.')
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-12 lg:flex lg:flex-col">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400">
            <Shield className="h-6 w-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-semibold text-white">CyberShield</span>
        </div>
        <div className="relative mt-auto max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight text-white">Ciberseguridad empresarial accesible para PYMEs.</h1>
          <p className="mt-4 text-slate-400">Sin necesidad de contar con un equipo interno especializado. Monitoreo continuo, respuesta humana y un CyberScore que cualquier gerente entiende.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
            {[[Activity, 'Monitoreo 24/7 con SIEM y EDR'], [Gauge, 'CyberScore de 0 a 100'], [Lock, 'Respuesta: aislar equipos'], [FileText, 'Reporte mensual para gerencia']].map(([I, t]) => (
              <div key={t} className="flex items-center gap-2 text-slate-300"><I className="h-4 w-4 text-cyan-400" />{t}</div>
            ))}
          </div>
        </div>
        <div className="relative mt-12 text-xs text-slate-500">MVP académico · Computación y Sociedad · TEC San Carlos · 2026</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Shield className="h-7 w-7 text-cyan-400" /><span className="text-xl font-semibold text-white">CyberShield</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-400">Ingrese a la consola SOC o al portal de su empresa.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Correo</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.cr" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" required />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button className="btn-primary w-full py-2.5">Entrar</button>
          </form>

          <div className="mt-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Accesos de demostración (contraseña: demo)</div>
            <div className="space-y-2">
              {USERS.map(u => (
                <button key={u.id} onClick={() => submit(null, u.email, u.password)}
                  className="card flex w-full items-center justify-between gap-3 p-3 text-left transition hover:border-cyan-500/50">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.title}</div>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${u.role === 'soc' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                    {u.role === 'soc' ? 'SOC' : 'Cliente'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
