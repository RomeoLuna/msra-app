import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MSRA from './MSRA.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MSRA />
  </StrictMode>
)
