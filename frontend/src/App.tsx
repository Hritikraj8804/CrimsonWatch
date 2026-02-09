import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SecurityProvider } from './hooks/useApi'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/Dashboard'
import { AgentsPage } from './pages/Agents'
import { AlertsPage } from './pages/Alerts'
import { ActivityPage } from './pages/Activity'
import { SettingsPage } from './pages/Settings'

function App() {
  return (
    <SecurityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SecurityProvider>
  )
}

export default App
