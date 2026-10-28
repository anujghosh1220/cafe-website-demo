import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Chef from './Chef.tsx'

import Cart from './Cart.tsx'
const path = window.location.pathname
const Comp = path.startsWith('/admin') ? Admin : path.startsWith('/chef') ? Chef : path.startsWith('/cart') ? Cart : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Comp />
  </StrictMode>,
)
