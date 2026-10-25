import { useState, useEffect } from 'react'
import { Menu, X, Phone, MapPin, Clock } from 'lucide-react'
import { cafeConfig as c } from './config'
import { supabase } from './supabase'

export default function App() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [dbItems, setDbItems] = useState<any[]>([])
  const [dbCats, setDbCats] = useState<any[]>([])
  useEffect(() => {
    if (!supabase) return
    supabase.from('categories').select('id,name').then(({data})=>setDbCats(data||[]))
    supabase.from('menu_items').select('id,name,description,price,category_id,image_url,available').eq('available',true).then(({data})=>setDbItems(data||[]))
  }, [])
  const categories = ['All','Drinks','Hot Drinks','Cold Drinks','Food','Desserts']
  const catName = (id:string) => dbCats.find(c=>c.id===id)?.name
  const filtered = dbItems.filter(m => {
    const cn = catName(m.category_id) || ''
    if (category === 'All') return true
    if (category === 'Drinks') return cn === 'Hot Drinks' || cn === 'Cold Drinks'
    return cn === category
  })
  const menuForRender = dbItems.length ? filtered.map(m=>({name:m.name,desc:m.description,price:`₹${m.price}`,image:m.image_url})) : c.menu
  return (
    <div className="font-sans">
      <nav className="sticky top-0 z-50 bg-mocha text-cream">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="#home" className="font-serif text-2xl">{c.logoText}</a>
          <div className="hidden md:flex gap-6 items-center">
            {['Home','Menu','About','Gallery','Contact'].map(l=>(
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-champagne transition">{l}</a>
            ))}
            <a href="#menu" className="bg-amber text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition">View Menu</a>
          </div>
          <button className="md:hidden" onClick={()=>setOpen(!open)} aria-label="menu">{open?<X/>:<Menu/>}</button>
        </div>
        {open && (
          <div className="md:hidden bg-mocha px-4 pb-4 flex flex-col gap-3">
            {['Home','Menu','About','Gallery','Contact'].map(l=>(
              <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setOpen(false)} className="hover:text-champagne">{l}</a>
            ))}
            <a href="#menu" onClick={()=>setOpen(false)} className="bg-amber text-white px-4 py-2 rounded-full text-center">View Menu</a>
          </div>
        )}
      </nav>

      <section id="home" className="relative">
        <img src={c.hero.image} alt="cafe" className="w-full h-[70vh] object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
        <div className="absolute inset-0 bg-mocha/50 flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-cream">
            <h1 className="font-serif text-4xl md:text-6xl mb-4">{c.hero.headline}</h1>
            <p className="max-w-xl mb-6 text-lg">{c.hero.description}</p>
            <div className="flex gap-3 flex-wrap">
              <a href="#menu" className="bg-amber text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition">Explore Our Menu</a>
              <a href="#contact" className="border border-cream text-cream px-6 py-3 rounded-full font-medium hover:bg-cream hover:text-mocha transition">Find Us</a>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl md:text-4xl text-mocha mb-2 text-center">Featured Menu</h2>
        <p className="text-center text-mocha/70 mb-6">A few of our favorites.</p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat=>(
            <button key={cat} onClick={()=>setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${category===cat ? 'bg-mocha text-cream' : 'bg-white text-mocha border border-mocha/20 hover:bg-champagne/40'}`}
            >{cat}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuForRender.map(m=>(
            <div key={m.name} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={m.image} alt={m.name} className="w-full h-48 object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
              <div className="p-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif text-xl text-mocha">{m.name}</h3>
                  <span className="text-amber font-semibold">{m.price}</span>
                </div>
                <p className="text-sm text-mocha/70 mt-1">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <img src={c.about.image} alt="about" className="rounded-2xl w-full h-80 object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-mocha mb-4">{c.about.heading}</h2>
            <p className="text-mocha/80 leading-relaxed">{c.about.text}</p>
          </div>
        </div>
      </section>

      <section id="gallery" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl md:text-4xl text-mocha mb-8 text-center">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {c.gallery.map((g,i)=>(
            <img key={i} src={g} alt={`gallery ${i+1}`} className="rounded-xl w-full h-48 object-cover hover:scale-[1.02] transition" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
          ))}
        </div>
      </section>

      <section id="contact" className="bg-mocha text-cream py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Visit Us</h2>
            <p className="flex items-start gap-2 mb-3"><MapPin className="mt-1 shrink-0"/> {c.visit.address}</p>
            <div className="mb-4">{c.visit.hours.map(h=><p key={h} className="flex items-center gap-2"><Clock size={16}/> {h}</p>)}</div>
            <div className="flex gap-3 flex-wrap">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.visit.mapsQuery)}`} target="_blank" rel="noreferrer" className="bg-amber text-white px-5 py-2 rounded-full font-medium">Get Directions</a>
              <a href={`https://wa.me/${c.visit.whatsapp}`} target="_blank" rel="noreferrer" className="border border-cream px-5 py-2 rounded-full font-medium hover:bg-cream hover:text-mocha transition flex items-center gap-2"><Phone size={16}/> WhatsApp</a>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center">
            <a href={c.social.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-champagne">Instagram</a>
            <a href={c.social.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-champagne">Facebook</a>
          </div>
        </div>
      </section>

      <footer className="bg-mocha/90 text-cream/80 py-8 text-center text-sm">
        <p className="font-serif text-lg text-cream mb-2">{c.name}</p>
        <p>{c.tagline}</p>
        <p className="mt-4">© {new Date().getFullYear()} {c.name}. All rights reserved.</p>
        <p className="mt-2"><a href="/admin" className="underline hover:text-champagne">Admin Login</a></p>
      </footer>
    </div>
  )
}
