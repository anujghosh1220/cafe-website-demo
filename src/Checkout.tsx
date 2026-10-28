import { useState } from 'react'
import { useCart } from './CartContext'
import { supabase } from './supabase'

export default function Checkout() {
  const { cart, total, clear } = useCart()
  const [table, setTable] = useState('')
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function placeOrder() {
    if (!table) { setError('Select a table'); return }
    if (!supabase) { setError('Backend not configured'); return }
    setPlacing(true); setError('')
    const items = cart.map((i: any) => ({ menu_item_id: i.id, quantity: i.qty }))
    const { data, error: err } = await supabase.rpc('create_order', { p_table_number: table, p_items: items, p_instructions: instructions || null })
    setPlacing(false)
    if (err) { setError(err.message); return }
    setOrderNumber(String(data))
    clear()
  }

  if (orderNumber) {
    return <div className="min-h-screen bg-cream text-mocha flex items-center justify-center p-8"><div className="text-center"><h1 className="font-serif text-3xl mb-2">Order placed</h1><p className="text-xl">{orderNumber}</p><a href="/" className="mt-4 inline-block bg-amber text-white px-6 py-3 rounded-full">Back to menu</a></div></div>
  }

  return (
    <div className="min-h-screen bg-cream text-mocha p-6 max-w-3xl mx-auto">
      <a href="/cart" className="inline-block mb-4 text-mocha/70 hover:text-mocha">← Back to Cart</a>
      <h1 className="font-serif text-3xl mb-6">Checkout</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        {cart.map((i: any) => <div key={i.id} className="flex justify-between py-1"><span>{i.qty}× {i.name}</span><span>₹{i.price * i.qty}</span></div>)}
        <div className="border-t mt-2 pt-2 font-semibold flex justify-between"><span>Total</span><span>₹{total}</span></div>
      </div>
      <select value={table} onChange={e => setTable(e.target.value)} className="w-full border p-2 rounded mb-3">
        <option value="">Select table</option>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={String(n)}>Table {n}</option>)}
      </select>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Customer name (optional)" className="w-full border p-2 rounded mb-3" />
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Kitchen instructions (optional)" className="w-full border p-2 rounded mb-3" />
      <button onClick={placeOrder} disabled={placing || cart.length === 0} className="bg-amber text-white px-6 py-3 rounded-full disabled:opacity-50">{placing ? 'Placing...' : 'Place Dine-in Order'}</button>
    </div>
  )
}
