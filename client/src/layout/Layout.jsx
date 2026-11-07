import { useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import ToastNotification from '../components/common/ToastNotification'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 w-100">
        <TopHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-main">
          {children}
        </main>
      </div>

      {/* Toast Notification matching UI Demo */}
      <ToastNotification />
    </div>
  )
}
