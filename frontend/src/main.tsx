import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './styles.css'
import { AuthProvider } from './common/services/authState'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
