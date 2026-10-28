import { useState, useEffect } from 'react'
import { supabase } from './supabase'

type CartItem = { id: string; name: string; price: number; qty: number }

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [table, setTable] = useState('')
  const [instructions, setInstructions] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('velvet_cart') || '[]')) } catch { setCart([]) }
  }, [])
  useEffect(() => { localStorage.setItem('velvet_cart', JSON.stringify(cart)) }, [cart])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i).filter(i => i.qty > 0))
  }
  function remove(id: string) { setCart(prev => prev.filter(i => i.id !== id)) }
  function clear() { if (confirm('Clear cart?')) setCart([]) }

  async function placeOrder() {
    if (!supabase || !table.trim()) return
    setPlacing(true)
    const items = cart.map(i => ({ menu_item_id: i.id, quantity: i.qty }))
    const { data, error } = await supabase.rpc('create_order', { p_table_number: table.trim(), p_items: items, p_instructions: instructions || null })
    setPlacing(false)
    if (error) { alert(error.message); return }
    setOrderNumber(String(data))
    setCart([])
    localStorage.removeItem('velvet_cart')
  }

  if (orderNumber) {
    return <div className="min-h-screen bg-cream text-mocha p-8 text-center"><h1 className="font-serif text-3xl mb-4">Order Confirmed</h1><p>Order number: {orderNumber}</p><a href="/" className="text-amber underline">Continue shopping</a></div>
  }

  return (
    <div className="min-h-screen bg-cream text-mocha p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl mb-4">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-mocha/60">Your cart is empty. <a href="/" className="text-amber underline">Continue shopping</a></p>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {cart.map(i => (
                <li key={i.id} className="bg-white rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-mocha/70">₹{i.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(i.id, -1)} className="px-2 py-1 border rounded">-</button>
                    <span>{i.qty}</span>
                    <button onClick={() => updateQty(i.id, 1)} className="px-2 py-1 border rounded">+</button>
                    <button onClick={() => remove(i.id)} className="text-red-600 text-sm ml-2">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="font-semibold">Total: ₹{total}</p>
            </div>
            <div className="flex gap-2 mb-4">
              <input value={table} onChange={e => setTable(e.target.value)} placeholder="Table number" className="border p-2 rounded flex-1" />
            </div>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Special instructions" className="w-full border p-2 rounded mb-4" />
            <div className="flex gap-3">
              <button onClick={placeOrder} disabled={placing || !table.trim()} className="bg-amber text-white px-6 py-2 rounded-full disabled:opacity-50">{placing ? 'Placing...' : 'Place Order'}</button>
              <button onClick={clear} className="px-6 py-2 rounded-full border">Clear Cart</button>
              <a href="/" className="px-6 py-2 rounded-full border">Continue Shopping</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
