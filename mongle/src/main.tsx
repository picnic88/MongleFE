import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

createRoot(
  document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )


// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
// import SleepContentPage from './page/SleepContentPage.tsx'
// import AiConsultationPage from './page/AiConsultationPage.tsx'

// const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
// const page = pathname === '/ai'
//   ? <AiConsultationPage />
//   : pathname === '/sleep-content'
//     ? <SleepContentPage />
//     : <App />

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     {page}
//   </StrictMode>,
// )
