import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './app/providers/AuthProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { PinScreen } from './features/auth/components/PinScreen'
import { Onboarding } from './features/auth/components/Onboarding'
import { AppLayout } from './shared/components/AppLayout'
import { Spinner } from './shared/components'

const Dashboard = lazy(() =>
  import('./features/dashboard/components/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const DocumentList = lazy(() =>
  import('./features/documents/components/DocumentList').then((m) => ({ default: m.DocumentList })),
)
const Checklist = lazy(() =>
  import('./features/checklist/components/Checklist').then((m) => ({ default: m.Checklist })),
)
const Settings = lazy(() => import('./app/pages/Settings').then((m) => ({ default: m.Settings })))
const Help = lazy(() => import('./app/pages/Help').then((m) => ({ default: m.Help })))

function AppContent() {
  const { isAuthenticated, isLocked, hasPin } = useAuth()
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(() => {
    return localStorage.getItem('onboarding_complete') === 'true'
  })

  if (!hasPin && !isOnboardingComplete) {
    return (
      <Onboarding
        onComplete={() => {
          setIsOnboardingComplete(true)
          localStorage.setItem('onboarding_complete', 'true')
        }}
      />
    )
  }

  if (!isAuthenticated || isLocked) {
    return <PinScreen />
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner className="w-12 h-12" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documentos" element={<DocumentList />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/ajuda" element={<Help />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
