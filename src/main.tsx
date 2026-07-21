import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PolygonTracerProvider } from './Context/PolygonContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PolygonTracerProvider>
      <App />
    </PolygonTracerProvider>
  </StrictMode>,
)
