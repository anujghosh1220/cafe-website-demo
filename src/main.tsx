import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Chef from './Chef.tsx'
import Cart from './Cart.tsx'
import Checkout from './Checkout.tsx'

const path = window.location.pathname
const Comp = path.startsWith('/admin') ? Admin : path.startsWith('/chef') ? Chef : path.startsWith('/cart') ? Cart : path.startsWith('/checkout') ? Checkout : App

import { CartProvider } from './CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <Comp />
    </CartProvider>
  </StrictMode>,
)
