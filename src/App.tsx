import { useState, useEffect, useMemo } from 'react'
import { Menu, X, Phone, MapPin, Clock, Search } from 'lucide-react'
import { cafeConfig as c } from './config'
import { supabase } from './supabase'

export default function App() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [dbItems, setDbItems] = useState<any[]>([])
  const [dbCats, setDbCats] = useState<any[]>([])
  const [scrolled, setScrolled] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [table, setTable] = useState('')
  const [instructions, setInstructions] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  function addToCart(m: any) {
    setCart(prev => {
      const ex = prev.find(p => p.id === m.id)
      const next = ex ? prev.map(p => p.id === m.id ? { ...p, qty: p.qty + 1 } : p) : [...prev, { id: m.id, name: m.name, price: parseFloat(String(m.price).replace(/[^\d.]/g, '')), qty: 1 }]
      localStorage.setItem('velvet_cart', JSON.stringify(next))
      return next
    })
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  async function placeOrder() {
    if (!supabase || !table.trim()) return
    setPlacing(true)
    const items = cart.map(i => ({ menu_item_id: i.id, quantity: i.qty }))
    const { data, error } = await supabase.rpc('create_order', { p_table_number: table.trim(), p_items: items, p_instructions: instructions || null })
    setPlacing(false)
    if (error) { alert(error.message); return }
    setOrderNumber(String(data))
    setCart([])
  }

  useEffect(() => {
    if (!supabase) return
    supabase.from('categories').select('id,name').then(({data})=>setDbCats(data||[]))
    supabase.from('menu_items').select('id,name,description,price,category_id,image_url,available').eq('available',true).then(({data})=>setDbItems(data||[]))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const catName = (id: string) => dbCats.find(c => c.id === id)?.name
  const ALIASES: Record<string, string[]> = {
    'velvet cappuccino': ['coffee', 'espresso', 'milk', 'foam'],
    'slow pour over': ['coffee', 'pour over', 'filter coffee'],
    'rose masala chai': ['tea', 'chai', 'rose'],
    'signature velvet latte': ['coffee', 'latte', 'espresso', 'caramel'],
    'iced americano': ['coffee', 'iced coffee', 'espresso', 'cold coffee', 'americano'],
    'almond croissant': ['dessert', 'pastry', 'croissant', 'almond'],
    'avocado toast': ['food', 'toast', 'avocado', 'sandwich'],
  }
  const categories = ['All', 'Drinks', ...dbCats.map(c => c.name).filter(n => n !== 'Drinks')]
  const filtered = useMemo(() => {
    const items = dbItems.length ? dbItems : c.menu.map((m, i) => ({ id: String(i), name: m.name, description: m.desc, price: parseFloat(m.price.replace(/[^\d.]/g, '')), category_id: null, image_url: m.image, available: true, _cat: m.category }))
    return items.filter(m => {
      const cn = dbItems.length ? (catName(m.category_id) || '') : (m._cat || '')
      if (category === 'All') {}
      else if (category === 'Drinks') { if (cn !== 'Hot Drinks' && cn !== 'Cold Drinks') return false }
      else if (cn !== category) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      const name = (m.name || '').toLowerCase()
      const desc = (m.description || m.desc || '').toLowerCase()
      const aliases = ALIASES[name] || []
      const haystack = [name, desc, cn.toLowerCase(), ...aliases.map(a => a.toLowerCase())].join(' ')
      const terms = q.split(/\s+/).filter(Boolean)
      return terms.every(t => haystack.includes(t))
    })
  }, [dbItems, dbCats, category, query])

  const displayItems = filtered.map(m => ({
    id: m.id,
    name: m.name,
    desc: m.description || m.desc,
    price: dbItems.length ? `₹${m.price}` : m.price,
    image: dbItems.length ? m.image_url : m.image,
  }))

  return (
    <div className="font-sans bg-cream text-mocha min-h-screen">
      <nav className={`fixed top-0 inset-x-0 z-50 transition ${scrolled ? 'bg-mocha/95 backdrop-blur' : 'bg-transparent'} text-cream`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="#home" className="font-serif text-2xl">The Velvet Bean</a>
          <div className="hidden md:flex gap-6 items-center">
            {['Home','Menu','Our Story','Visit Us'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="hover:text-champagne transition">{l}</a>
            ))}
            <a href="/cart" className="relative hover:text-champagne transition">Cart</a>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="md:hidden bg-mocha px-4 pb-4 flex flex-col gap-3">
            {['Home','Menu','Our Story','Visit Us'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} onClick={() => setOpen(false)} className="hover:text-champagne">{l}</a>
            ))}
            <a href="#menu" onClick={() => setOpen(false)} className="bg-amber text-white px-4 py-2 rounded-full text-center">Explore Menu</a>
          </div>
        )}
      </nav>

      <section id="home" className="relative min-h-screen flex items-center">
        <img src={c.hero.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-mocha/70 via-mocha/50 to-mocha/80" />
        <div className="relative max-w-6xl mx-auto px-4 text-cream">
          <h1 className="font-serif text-5xl md:text-7xl mb-4">Your daily ritual, reimagined.</h1>
          <p className="max-w-xl mb-6 text-lg text-cream/90">{c.hero.description}</p>
          <div className="flex gap-3 flex-wrap">
            <a href="#menu" className="bg-amber text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition">Explore the Menu</a>
            <a href="#visit-us" className="border border-cream text-cream px-6 py-3 rounded-full font-medium hover:bg-cream hover:text-mocha transition">Visit Us</a>
          </div>
        </div>
      </section>

      <section id="menu" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="font-serif text-3xl md:text-5xl text-mocha mb-2 text-center">Featured Menu</h2>
        <p className="text-center text-mocha/70 mb-8">A few of our favorites.</p>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mocha/50" size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search menu" className="w-full pl-10 pr-4 py-2 rounded-full border border-mocha/20 bg-white" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${category === cat ? 'bg-mocha text-cream' : 'bg-white text-mocha border border-mocha/20 hover:bg-champagne/40'}`}>{cat}</button>
            ))}
          </div>
        </div>
        {displayItems.length === 0 ? (
          <p className="text-center text-mocha/60">No items found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map(m => (
              <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
            {m.image ? (
              <img src={m.image} alt={m.name} className="w-full h-48 object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <div className="w-full h-48 bg-champagne/30 flex items-center justify-center text-mocha/50">No image</div>
            )}
                <div className="p-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-xl text-mocha">{m.name}</h3>
                    <span className="text-amber font-semibold">{m.price}</span>
                  </div>
                  <p className="text-sm text-mocha/70 mt-1">{m.desc}</p>
                  <button onClick={() => addToCart(m)} className="mt-3 text-sm bg-amber text-white px-3 py-1 rounded-full">Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="our-story" className="bg-cream py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <img src={c.about.image} alt="cafe" className="rounded-2xl w-full h-80 object-cover" />
          <div>
            <h2 className="font-serif text-3xl md:text-5xl text-mocha mb-4">{c.about.heading}</h2>
            <p className="text-mocha/80 leading-relaxed">{c.about.text}</p>
          </div>
        </div>
      </section>

      <section id="visit-us" className="bg-mocha text-cream py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Visit Us</h2>
            <p className="flex items-start gap-2 mb-3"><MapPin className="mt-1 shrink-0" /> {c.visit.address}</p>
            <div className="mb-4">{c.visit.hours.map(h => <p key={h} className="flex items-center gap-2"><Clock size={16} /> {h}</p>)}</div>
            <div className="flex gap-3 flex-wrap">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.visit.mapsQuery)}`} target="_blank" rel="noreferrer" className="bg-amber text-white px-5 py-2 rounded-full font-medium">Get Directions</a>
              <a href={`https://wa.me/${c.visit.whatsapp}`} target="_blank" rel="noreferrer" className="border border-cream px-5 py-2 rounded-full font-medium hover:bg-cream hover:text-mocha transition flex items-center gap-2"><Phone size={16} /> WhatsApp</a>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center">
            <a href={c.social.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-champagne">Instagram</a>
            <a href={c.social.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-champagne">Facebook</a>
          </div>
        </div>
      </section>

      {cart.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-mocha text-cream px-6 py-3 rounded-full shadow-lg flex gap-4 items-center">
          <span>{cart.length} items · ₹{total}</span>
          <button onClick={() => setCheckoutOpen(true)} className="bg-amber text-white px-4 py-1 rounded-full">Checkout</button>
        </div>
      )}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-2xl mb-4">Checkout</h3>
            <input value={table} onChange={e => setTable(e.target.value)} placeholder="Table number" className="w-full border p-2 rounded mb-3" />
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Special instructions" className="w-full border p-2 rounded mb-3" />
            <p className="mb-3 font-semibold">Total: ₹{total}</p>
            <div className="flex gap-2">
              <button onClick={placeOrder} disabled={placing || !table.trim()} className="bg-amber text-white px-4 py-2 rounded-full disabled:opacity-50">{placing ? 'Placing...' : 'Place Order'}</button>
              <button onClick={() => setCheckoutOpen(false)} className="px-4 py-2 rounded-full border">Cancel</button>
            </div>
            {orderNumber && <p className="mt-3 text-green-700">Order placed: {orderNumber}</p>}
          </div>
        </div>
      )}
      <footer className="bg-mocha/90 text-cream/80 py-8 text-center text-sm">
        <p>{c.tagline}</p>
        <p className="mt-4">© {new Date().getFullYear()} The Velvet Bean. All rights reserved.</p>
        <p className="mt-2"><a href="/admin" className="underline hover:text-champagne">Admin Login</a></p>
      </footer>
    </div>
  )
}
