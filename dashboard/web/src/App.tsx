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
import WorkflowPage from './pages/WorkflowPage'
import SettingsPage from './pages/SettingsPage'
import { PageLoading } from './components/common/Loading'

function AuthenticatedApp() {
  useSSE()

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/todo" element={<TodoView />} />
        <Route path="/agents" element={<AgentMonitor />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/workflow" element={<WorkflowPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
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
