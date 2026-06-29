import React from 'react'
import './index.css'
import ReactDOM from 'react-dom/client'
import "nes.css/css/nes.min.css";
import AppRoutes from './routes/AppRoutes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)