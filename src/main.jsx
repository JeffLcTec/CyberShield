import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './index.css'
import { StoreProvider, useStore } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Soc from './pages/Soc'
import Clients from './pages/Clients'
import ClientDashboard from './pages/ClientDashboard'
import Alerts from './pages/Alerts'
import Endpoints from './pages/Endpoints'
import Vulns from './pages/Vulns'
import Posture from './pages/Posture'
import Report from './pages/Report'
import Plans from './pages/Plans'
import AuditLog from './pages/AuditLog'

function RequireAuth({ children, soc }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  if (soc && user.role !== 'soc') return <Navigate to="/" replace />
  return children
}

// Un usuario cliente solo puede ver su propia empresa
function ClientGuard({ children }) {
  const { user, state } = useStore()
  const { clientId } = useParams()
  if (user.role === 'cliente' && user.clientId !== clientId) return <Navigate to={`/c/${user.clientId}`} replace />
  if (!state.clients.some(c => c.id === clientId)) return <Navigate to="/" replace />
  return children
}

function Home() {
  const { user } = useStore()
  return <Navigate to={user.role === 'soc' ? '/soc' : `/c/${user.clientId}`} replace />
}

const c = el => <ClientGuard>{el}</ClientGuard>

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="soc" element={<RequireAuth soc><Soc /></RequireAuth>} />
            <Route path="alertas" element={<RequireAuth soc><Alerts /></RequireAuth>} />
            <Route path="clientes" element={<RequireAuth soc><Clients /></RequireAuth>} />
            <Route path="planes" element={<RequireAuth soc><Plans /></RequireAuth>} />
            <Route path="bitacora" element={<RequireAuth soc><AuditLog /></RequireAuth>} />
            <Route path="c/:clientId" element={c(<ClientDashboard />)} />
            <Route path="c/:clientId/alertas" element={c(<Alerts />)} />
            <Route path="c/:clientId/equipos" element={c(<Endpoints />)} />
            <Route path="c/:clientId/vulnerabilidades" element={c(<Vulns />)} />
            <Route path="c/:clientId/postura" element={c(<Posture />)} />
            <Route path="c/:clientId/reporte" element={c(<Report />)} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
)
