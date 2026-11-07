import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layout/Layout'
import DashboardPage from './pages/DashboardPage'
import EntityDataPage from './pages/EntityDataPage'
import NotFoundPage from './pages/NotFoundPage'
import { ENTITIES_CONFIG } from './config/routesConfig'

export default function App() {
  const entityKeys = Object.keys(ENTITIES_CONFIG)

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Default Route redirects to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route - Only has title "Dashboard" as specified */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Dynamic Routes for all 22 Entities */}
          {entityKeys.map((entityKey) => (
            <Route
              key={entityKey}
              path={`/${entityKey}`}
              element={<EntityDataPage entityKey={entityKey} />}
            />
          ))}

          {/* Also support singular alias routes if needed */}
          <Route path="/vehicle" element={<Navigate to="/vehicles" replace />} />
          <Route path="/bus" element={<Navigate to="/buses" replace />} />
          <Route path="/train" element={<Navigate to="/trains" replace />} />
          <Route path="/road" element={<Navigate to="/roads" replace />} />
          <Route path="/location" element={<Navigate to="/locations" replace />} />
          <Route path="/intersection" element={<Navigate to="/intersections" replace />} />
          <Route path="/public-transit" element={<Navigate to="/public-transits" replace />} />
          <Route path="/rail-track" element={<Navigate to="/rail-tracks" replace />} />
          <Route path="/transit-schedule" element={<Navigate to="/transit-schedules" replace />} />
          <Route path="/passenger" element={<Navigate to="/passengers" replace />} />
          <Route path="/traffic-authority" element={<Navigate to="/traffic-authorities" replace />} />
          <Route path="/traffic-violation" element={<Navigate to="/traffic-violations" replace />} />
          <Route path="/traffic-signal" element={<Navigate to="/traffic-signals" replace />} />
          <Route path="/city-planner" element={<Navigate to="/city-planners" replace />} />
          <Route path="/emergency-vehicle" element={<Navigate to="/emergency-vehicles" replace />} />
          <Route path="/emergency-response" element={<Navigate to="/emergency-responses" replace />} />
          <Route path="/traffic-camera" element={<Navigate to="/traffic-cameras" replace />} />
          <Route path="/road-sensor" element={<Navigate to="/road-sensors" replace />} />
          <Route path="/traffic-monitoring-record" element={<Navigate to="/traffic-monitoring-records" replace />} />

          {/* 404 Page Not Found error handling */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
