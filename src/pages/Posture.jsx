import { useParams } from 'react-router-dom'
import { KeyRound, Mail, HardDrive, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import { useStore } from '../store'
import { computeFactors } from '../lib/score'
import { Badge, Bar, PageHeader } from '../components/ui'

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-700'}`} aria-pressed={on}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-5.5' : 'left-0.5'}`} />
    </button>
  )
}

function Section({ icon: Icon, title, factor, children, desc }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10"><Icon className="h-5 w-5 text-cyan-400" /></div>
          <div><h2 className="font-semibold text-white">{title}</h2><p className="text-xs text-slate-500">{desc}</p></div>
        </div>
        <div className="w-40"><div className="mb-1 text-right text-sm font-semibold text-white">{factor}/100</div><Bar value={factor} /></div>
      </div>
      {children}
    </div>
  )
}

const DNS = {
  spf: d => `${d}.  TXT  "v=spf1 include:spf.protection.outlook.com -all"`,
  dkim: d => `selector1._domainkey.${d}.  CNAME  selector1-${d.replace(/\./g, '-')}._domainkey`,
  dmarc: d => `_dmarc.${d}.  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@cybershield.cr"`,
}

export default function Posture() {
  const { clientId } = useParams()
  const { state, toggleMfa, setEmail, setBackup } = useStore()
  const client = state.clients.find(c => c.id === clientId)
  const f = computeFactors(state, clientId)
  const accs = state.accounts.filter(a => a.clientId === clientId)
  const b = client.backup
  const em = client.email

  return (
    <div>
      <PageHeader title="Accesos, correo y respaldos" subtitle="Controles básicos que forman parte del CyberScore. Los cambios se reflejan de inmediato en el puntaje." />
      <div className="space-y-6">
        <Section icon={KeyRound} title="MFA y control de accesos" factor={f.mfa} desc="Peso 20 %. Las cuentas privilegiadas cuentan el doble.">
          <div className="divide-y divide-slate-800">
            {accs.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">{a.name}{a.privileged && <Badge cls="bg-amber-500/15 text-amber-200 ring-amber-500/30">Privilegiada</Badge>}</div>
                  <div className="text-xs text-slate-500">{a.system}</div>
                </div>
                <span className={`hidden text-xs sm:inline ${a.mfa ? 'text-emerald-400' : 'text-rose-400'}`}>{a.mfa ? 'MFA activo' : 'Sin MFA'}</span>
                <Toggle on={a.mfa} onChange={() => toggleMfa(a.id)} />
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Mail} title={`Protección del correo · ${em.domain}`} factor={f.email} desc="Peso 15 %. Evita que terceros envíen correos falsos a nombre de la empresa.">
          <div className="grid gap-3 md:grid-cols-3">
            {[['spf', 'SPF', 'Indica qué servidores pueden enviar correo del dominio.'], ['dkim', 'DKIM', 'Firma digital que prueba que el correo no fue alterado.'], ['dmarc', 'DMARC', 'Le dice al mundo qué hacer con correos falsos.']].map(([k, label, help]) => (
              <div key={k} className="rounded-lg border border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-slate-200">{em[k] ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-400" />}{label}</div>
                  <Toggle on={em[k]} onChange={() => setEmail(clientId, k, !em[k])} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{help}</p>
                <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded bg-slate-950 p-2 text-[10px] text-slate-400">{DNS[k](em.domain)}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={HardDrive} title="Respaldos" factor={f.backup} desc="Peso 15 %. Clave para recuperarse de un ransomware sin pagar rescate.">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 p-4">
              <div className="text-xs text-slate-500">Último respaldo exitoso</div>
              <div className={`mt-1 text-lg font-semibold ${b.lastHours <= 24 ? 'text-emerald-400' : b.lastHours <= 72 ? 'text-amber-300' : 'text-rose-400'}`}>hace {b.lastHours} h</div>
              <div className="text-xs text-slate-500">Frecuencia: {b.frequency}</div>
              <button className="btn-ghost mt-3 w-full text-xs" onClick={() => setBackup(clientId, { lastHours: 0, frequency: b.frequency === 'Sin definir' ? 'Diario' : b.frequency }, 'Registró un respaldo completo exitoso')}>Ejecutar respaldo ahora</button>
            </div>
            <div className="rounded-lg border border-slate-800 p-4">
              <div className="text-xs text-slate-500">Prueba de restauración</div>
              <div className={`mt-1 text-lg font-semibold ${b.tested ? 'text-emerald-400' : 'text-rose-400'}`}>{b.tested ? 'Verificada' : 'Nunca probada'}</div>
              <div className="text-xs text-slate-500">Un respaldo que no se prueba puede no servir.</div>
              <button className="btn-ghost mt-3 w-full text-xs" onClick={() => setBackup(clientId, { tested: !b.tested }, b.tested ? 'Marcó la prueba de restauración como vencida' : 'Registró una prueba de restauración exitosa')}>{b.tested ? 'Marcar como vencida' : 'Registrar prueba exitosa'}</button>
            </div>
            <div className="rounded-lg border border-slate-800 p-4">
              <div className="text-xs text-slate-500">Copia fuera de la oficina</div>
              <div className={`mt-1 text-lg font-semibold ${b.offsite ? 'text-emerald-400' : 'text-rose-400'}`}>{b.offsite ? 'Sí (nube cifrada)' : 'No'}</div>
              <div className="text-xs text-slate-500">Regla 3-2-1: una copia separada de la red.</div>
              <button className="btn-ghost mt-3 w-full text-xs" onClick={() => setBackup(clientId, { offsite: !b.offsite }, b.offsite ? 'Desactivó la copia fuera de sitio' : 'Activó copia cifrada fuera de sitio')}>{b.offsite ? 'Desactivar' : 'Activar copia en la nube'}</button>
            </div>
          </div>
          {b.lastHours > 72 && <div className="mt-3 flex items-center gap-2 text-xs text-rose-300"><ShieldAlert className="h-4 w-4" /> Más de 3 días sin respaldo: ante un ransomware se perdería la información de ese periodo.</div>}
        </Section>
      </div>
    </div>
  )
}
