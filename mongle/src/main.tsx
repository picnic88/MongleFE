import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './route/router';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App";
// import { BrowserRouter } from "react-router-dom";

// createRoot(
//   document.getElementById('root')!).render(
//     <StrictMode>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </StrictMode>
//   )


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
