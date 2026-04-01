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
import { PageLoading } from './components/common/Loading'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function AuthenticatedApp() {
  useSSE()

  return (
    <Layout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/todo" element={<TodoView />} />
        <Route path="/labor" element={<LaborEstimatePage />} />
        <Route path="/agents" element={<AgentMonitor />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/tests" element={<TestLab />} />
        <Route path="/test-results" element={<TestResults />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
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
