import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SleepContentPage from './page/SleepContentPage.tsx'
import AiConsultationPage from './pages/AiConsultationPage.tsx'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const page = pathname === '/ai'
  ? <AiConsultationPage />
  : pathname === '/sleep-content'
    ? <SleepContentPage />
    : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
