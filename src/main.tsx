import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './modules/core/contexts/AuthContext'
import { configurationUnavailable } from './modules/core/services/firebaseConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {configurationUnavailable ? <main role="alert" style={{ padding: '2rem', maxWidth: '40rem', margin: 'auto' }}>
      <h1>Acesso temporariamente indisponível</h1>
      <p>A configuração desta instalação está incompleta. Avise o responsável pelo endereço da plataforma.</p>
    </main> : <AuthProvider>
      <App />
    </AuthProvider>}
  </StrictMode>,
)
