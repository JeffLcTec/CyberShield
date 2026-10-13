import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Building2, Siren, Monitor, Bug, KeyRound, FileText,
  CreditCard, ScrollText, LogOut, Menu, X, RotateCcw, ChevronDown,
} from 'lucide-react'
import { useStore } from '../store'

function Item({ to, icon: Icon, children, badge, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{children}</span>
      {badge > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{badge}</span>}
    </NavLink>
  )
}

export default function Layout() {
  const { state, user, logout, reset } = useStore()
  const { clientId: routeClient } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const isSoc = user.role === 'soc'
  const clientId = isSoc ? routeClient : user.clientId
  const client = state.clients.find(c => c.id === clientId)
  const openAlerts = cid => state.alerts.filter(a => (!cid || a.clientId === cid) && (a.status === 'nueva' || a.status === 'escalada')).length

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-4" onClick={() => setOpen(false)}>
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400">
          <Shield className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-semibold text-white">CyberShield</div>
          <div className="text-[11px] text-slate-500">{isSoc ? 'Consola SOC' : 'Portal del cliente'}</div>
        </div>
      </div>

      {isSoc && <>
        <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Operación</div>
        <Item to="/soc" icon={LayoutDashboard} end>Centro de operaciones</Item>
        <Item to="/alertas" icon={Siren} badge={openAlerts()}>Cola de alertas</Item>
        <Item to="/clientes" icon={Building2}>Clientes</Item>
        <Item to="/bitacora" icon={ScrollText}>Bitácora de acciones</Item>
        <Item to="/planes" icon={CreditCard}>Planes y precios</Item>
      </>}

      {client && <>
        <div className="mt-4 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {isSoc ? client.name : 'Mi empresa'}
        </div>
        <Item to={`/c/${client.id}`} icon={LayoutDashboard} end>Resumen y CyberScore</Item>
        <Item to={`/c/${client.id}/alertas`} icon={Siren} badge={openAlerts(client.id)}>Alertas e incidentes</Item>
        <Item to={`/c/${client.id}/equipos`} icon={Monitor}>Equipos (EDR)</Item>
        <Item to={`/c/${client.id}/vulnerabilidades`} icon={Bug}>Vulnerabilidades</Item>
        <Item to={`/c/${client.id}/postura`} icon={KeyRound}>Accesos, correo y respaldos</Item>
        <Item to={`/c/${client.id}/reporte`} icon={FileText}>Reporte mensual</Item>
      </>}

      <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
        <div className="px-2">
          <div className="text-sm font-medium text-slate-200">{user.name}</div>
          <div className="text-xs text-slate-500">{user.title}</div>
        </div>
        <button className="btn-ghost w-full justify-start text-xs" onClick={() => { if (confirm('¿Restablecer todos los datos de demostración?')) reset() }}>
          <RotateCcw className="h-3.5 w-3.5" /> Restablecer datos demo
        </button>
        <button className="btn-ghost w-full justify-start text-xs" onClick={() => { logout(); navigate('/login') }}>
          <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex h-full">
      <aside className="no-print hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950" onClick={e => e.stopPropagation()}>{nav}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur lg:px-8">
          <button className="btn-ghost px-2 lg:hidden" onClick={() => setOpen(true)}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          {isSoc ? (
            <div className="relative">
              <select className="input appearance-none pr-8" value={clientId || ''}
                onChange={e => navigate(e.target.value ? `/c/${e.target.value}` : '/soc')}>
                <option value="">Todos los clientes</option>
                {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          ) : (
            <div className="text-sm text-slate-300">{client?.name}</div>
          )}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
            <span className="hidden sm:inline">Monitoreo activo · SIEM conectado</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
