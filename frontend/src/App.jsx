import React from 'react'

import './App.css'
import './styles/theme.css'
import AppRoutes from './routes/AppRoutes'
import ErrorBoundary from './components/ErrorBoundary'

function App() {


  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App
