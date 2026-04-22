/**
 * App — 主应用组件 (routing + auth guard)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useSSE } from './hooks/useSSE'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import CaseDetail from './pages/CaseDetail'
import TodoView from './pages/TodoView'
import AgentMonitor from './pages/AgentMonitor'
import DraftsPage from './pages/DraftsPage'
import LaborEstimatePage from './pages/LaborEstimatePage'
import SettingsPage from './pages/SettingsPage'
import Issues from './pages/Issues'
import CasesPage from './pages/CasesPage'
import TestLab from './pages/TestLab'
import TestResults from './pages/TestResults'
import PatrolPage from './pages/PatrolPage'
import AutomationsPage from './pages/AutomationsPage'
import { PageLoading } from './components/common/Loading'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { useNotificationStore } from './stores/notificationStore'

function GlobalNotificationBanner() {
  const notifications = useNotificationStore((s) => s.notifications)
  const dismiss = useNotificationStore((s) => s.dismiss)

  if (notifications.length === 0) return null

  const colorMap = {
    info: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: 'var(--border-subtle)' },
    success: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: 'var(--border-subtle)' },
    warning: { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
    error: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: 'var(--accent-red)' },
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {notifications.map((n) => {
        const c = colorMap[n.type]
        return (
          <div
            key={n.id}
            style={{
              background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <span>{n.msg}</span>
            <button onClick={() => dismiss(n.id)} style={{ marginLeft: 8, opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontSize: '12px' }}>✕</button>
          </div>
        )
      })}
    </div>
  )
}

function AuthenticatedApp() {
  useSSE()

  return (
    <>
      <GlobalNotificationBanner />
      <Layout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/todo" element={<TodoView />} />
        <Route path="/labor" element={<LaborEstimatePage />} />
        <Route path="/agents" element={<AgentMonitor />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/tests" element={<TestLab />} />
        <Route path="/test-results" element={<TestResults />} />
        <Route path="/patrol" element={<PatrolPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </Layout>
    </>
  )
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <PageLoading />

  return (
    <BrowserRouter>
      {isAuthenticated ? <AuthenticatedApp /> : <LoginPage />}
    </BrowserRouter>
  )
}
