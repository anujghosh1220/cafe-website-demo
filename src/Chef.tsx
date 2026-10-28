import { useState, useEffect } from 'react'
import { supabase, isConfigured } from './supabase'

type Item = { id: string; item_name: string; quantity: number; unit_price: number }
type Order = { id: string; order_number: string; table_number: string; status: string; total: number; created_at: string; items: Item[] }

export default function Chef() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) return
    supabase.from('admin_profiles').select('role').eq('user_id', session.user.id).maybeSingle().then(({ data }) => setRole(data?.role || null))
  }, [session])

  async function load() {
    if (!supabase) return
    setLoading(true)
    const { data: ords } = await supabase.from('orders').select('id,order_number,table_number,status,total,created_at').order('created_at', { ascending: true })
    const ids = (ords || []).map(o => o.id)
    const { data: its } = ids.length ? await supabase.from('order_items').select('id,order_id,item_name,quantity,unit_price').in('order_id', ids) : { data: [] }
    const mapped = (ords || []).map(o => ({ ...o, items: (its || []).filter(i => i.order_id === o.id) }))
    setOrders(mapped)
    setLoading(false)
  }

  useEffect(() => { if (role === 'admin' || role === 'chef') load() }, [role])

  useEffect(() => {
    if (!supabase || !(role === 'admin' || role === 'chef')) return
    const channel = supabase!.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load()).subscribe()
    return () => { supabase!.removeChannel(channel) }
  }, [role])

  async function advance(id: string, status: string) {
    if (!supabase) return
    const next = status === 'new' ? 'preparing' : status === 'preparing' ? 'ready' : status === 'ready' ? 'completed' : null
    if (!next) return
    await supabase.rpc('advance_order_status', { p_order_id: id, p_status: next })
    load()
  }

  if (!isConfigured) return <div className="p-8">Setup required</div>
  if (!session) return <div className="p-8">Login required</div>
  if (role !== 'admin' && role !== 'chef') return <div className="p-8">Forbidden</div>

  const filtered = filter === 'all' ? orders.filter(o => o.status !== 'completed') : orders.filter(o => o.status === filter)
  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    active: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-cream text-mocha p-4">
      <header className="bg-mocha text-cream p-4 rounded-2xl mb-4 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl">Kitchen Display</h1>
          <p className="text-sm text-cream/70">The Velvet Bean</p>
        </div>
        <button onClick={() => supabase?.auth.signOut()} className="bg-amber text-white px-4 py-2 rounded-full">Logout</button>
      </header>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl shadow">New: {counts.new}</div>
        <div className="bg-white p-3 rounded-xl shadow">Preparing: {counts.preparing}</div>
        <div className="bg-white p-3 rounded-xl shadow">Ready: {counts.ready}</div>
        <div className="bg-white p-3 rounded-xl shadow">Active: {counts.active}</div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','new','preparing','ready','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-sm ${filter === f ? 'bg-mocha text-cream' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>
      {loading && <p>Loading…</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex justify-between mb-2">
              <span className="font-serif text-lg">{o.order_number}</span>
              <span className="text-sm text-mocha/60">Table {o.table_number}</span>
            </div>
            <p className="text-xs text-mocha/60 mb-2">{new Date(o.created_at).toLocaleTimeString()}</p>
            <ul className="text-sm mb-3">
              {o.items.map(i => <li key={i.id}>{i.quantity}× {i.item_name}</li>)}
            </ul>
            <p className="font-semibold mb-3">₹{o.total}</p>
            {o.status !== 'completed' && (
              <button onClick={() => advance(o.id, o.status)} className="bg-amber text-white px-4 py-2 rounded-full text-sm">
                {o.status === 'new' ? 'Start Preparing' : o.status === 'preparing' ? 'Mark Ready' : 'Mark Served'}
              </button>
            )}
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <p className="text-mocha/60 mt-4">No orders.</p>}
    </div>
  )
}
