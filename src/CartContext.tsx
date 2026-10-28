import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext<any>(null)

export function CartProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('cart') || '[]')
      if (!Array.isArray(raw)) return []
      return raw.map((i: any) => ({
        id: i?.id,
        name: i?.name || 'Item',
        image: i?.image,
        description: i?.description,
        price: Number(i?.price ?? i?.unit_price ?? 0),
        qty: Math.max(1, Number(i?.qty ?? i?.quantity ?? 1)),
      })).filter((i: any) => i.id && Number.isFinite(i.price) && i.price > 0)
    } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])
  const addToCart = (item: any) => setCart(prev => {
    const ex = prev.find(p => p.id === item.id)
    if (ex) return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
    return [...prev, { ...item, price: Number(item.price), qty: 1 }]
  })
  const updateQty = (id: string, qty: number) => setCart(prev => qty < 1 ? prev.filter(p => p.id !== id) : prev.map(p => p.id === id ? { ...p, qty } : p))
  const remove = (id: string) => setCart(prev => prev.filter(p => p.id !== id))
  const clear = () => setCart([])
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)
  return <CartContext.Provider value={{ cart, addToCart, updateQty, remove, clear, total, count }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
