import { useState, useEffect } from 'react'
import { supabase, isConfigured } from './supabase'

type Category = { id: string; name: string }
type MenuItem = { id: string; name: string; description: string | null; price: number; category_id: string | null; image_url: string | null; available: boolean }

export default function Admin() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [section, setSection] = useState('Overview')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [loadingAdmin, setLoadingAdmin] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [dataError, setDataError] = useState('')
  const [loadingData, setLoadingData] = useState(false)

  const [newCat, setNewCat] = useState('')
  const [adminProfiles, setAdminProfiles] = useState<{user_id:string;email:string;role:string;created_at:string}[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminRole, setAdminRole] = useState('admin')
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', available: true })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) { setIsAdmin(null); return }
    setLoadingAdmin(true)
    supabase.from('admin_profiles').select('user_id,role').eq('user_id', session.user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error('admin profile check failed', error.message); setIsAdmin(false) }
        else { setIsAdmin(!!data); setCurrentRole(data?.role || null) }
        setLoadingAdmin(false)
      })
  }, [session])

  async function loadData() {
    if (!supabase) return
    setLoadingData(true); setDataError('')
    const [c, m, a] = await Promise.all([
      supabase.from('categories').select('id,name').order('name'),
      supabase.from('menu_items').select('id,name,description,price,category_id,image_url,available').order('name'),
      supabase.from('admin_profiles').select('user_id,email,role,created_at').order('email')
    ])
    if (c.error || m.error || a.error) setDataError((c.error || m.error || a.error)?.message || 'Error')
    else { setCategories(c.data || []); setItems(m.data || []); setAdminProfiles(a.data || []) }
    setLoadingData(false)
  }

  useEffect(() => { if (isAdmin) loadData() }, [isAdmin])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }
  async function logout() { if (supabase) await supabase.auth.signOut() }

  async function addCategory() {
    if (!supabase || !newCat.trim()) return
    const { error } = await supabase.from('categories').insert({ name: newCat.trim() })
    if (error) setDataError(error.message); else { setNewCat(''); loadData() }
  }
  async function renameCategory() {
    if (!supabase || !editingCat) return
    const { error } = await supabase.from('categories').update({ name: editingCat.name }).eq('id', editingCat.id)
    if (error) setDataError(error.message); else { setEditingCat(null); loadData() }
  }
  async function deleteCategory(id: string) {
    if (!supabase) return
    const used = items.filter(i => i.category_id === id).length
    if (used > 0 && !confirm(`Category has ${used} items. Delete anyway? Items will be orphaned.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) setDataError(error.message); else loadData()
  }

  function startEditItem(item: MenuItem) {
    setEditingItem(item)
    setItemForm({ name: item.name, description: item.description || '', price: String(item.price), category_id: item.category_id || '', image_url: item.image_url || '', available: item.available })
  }
  async function saveItem() {
    if (!supabase) return
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.category_id) { setDataError('Name, price, category required'); return }
    const payload = { name: itemForm.name.trim(), description: itemForm.description, price: Number(itemForm.price), category_id: itemForm.category_id, image_url: itemForm.image_url || null, available: itemForm.available }
    const { error } = editingItem
      ? await supabase.from('menu_items').update(payload).eq('id', editingItem.id)
      : await supabase.from('menu_items').insert(payload)
    if (error) setDataError(error.message); else { setEditingItem(null); setItemForm({ name: '', description: '', price: '', category_id: '', image_url: '', available: true }); loadData() }
  }
  async function deleteItem(id: string) {
    if (!supabase || !confirm('Delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) setDataError(error.message); else loadData()
  }
  async function toggleAvailable(item: MenuItem) {
    if (!supabase) return
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id)
    loadData()
  }

  if (!isConfigured) return <div className="min-h-screen bg-cream text-mocha p-8"><h1 className="font-serif text-3xl mb-4">Admin setup required</h1><p>Set env vars.</p></div>
  if (!session || isAdmin === false) {
    if (session && loadingAdmin) return <div className="min-h-screen bg-cream flex items-center justify-center"><p>Checking authorization…</p></div>
    if (session && isAdmin === false) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl shadow text-center"><p className="mb-4">Not authorized.</p><button onClick={logout} className="bg-mocha text-cream px-4 py-2 rounded-full">Logout</button></div></div>
    return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><form onSubmit={login} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm"><h1 className="font-serif text-2xl text-mocha mb-4">Admin Login</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded mb-3" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded mb-3" />{error && <p className="text-red-600 text-sm mb-3">{error}</p>}<button className="w-full bg-mocha text-cream py-2 rounded-full">Sign In</button></form></div>
  }

  if (currentRole === 'chef') {
    return (
      <div className="min-h-screen bg-cream text-mocha">
        <header className="bg-mocha text-cream p-4 flex justify-between">
          <span className="font-serif text-xl">Chef Dashboard</span>
          <button onClick={logout} className="bg-amber text-white px-4 py-1 rounded-full">Logout</button>
        </header>
        <main className="max-w-6xl mx-auto p-6">
          <h2 className="font-serif text-2xl mb-2">Kitchen</h2>
          <p className="text-mocha/70">No order backend is available in this project yet.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream text-mocha">
      <header className="bg-mocha text-cream p-4 flex justify-between">
        <span className="font-serif text-xl">Admin Dashboard</span>
        <button onClick={logout} className="bg-amber text-white px-4 py-1 rounded-full">Logout</button>
      </header>
      <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-4 gap-4">
        <aside className="space-y-2">
          {['Overview','Manage Menu','Manage Categories','Manage Users'].map(s=>(
            <button key={s} onClick={()=>setSection(s)} className={`block w-full text-left px-3 py-2 rounded ${section===s?'bg-mocha text-cream':'hover:bg-champagne/40'}`}>{s}</button>
          ))}
        </aside>
        <main className="md:col-span-3 bg-white rounded-2xl p-6 shadow">
          {dataError && <p className="text-red-600 mb-3">{dataError}</p>}
          {loadingData && <p>Loading…</p>}
          {section === 'Overview' && !loadingData && (
            <div>
              <h2 className="font-serif text-2xl mb-4">Overview</h2>
              <p>Categories: {categories.length}</p>
              <p>Menu items: {items.length}</p>
              <p>Available: {items.filter(i=>i.available).length}</p>
            </div>
          )}
          {section === 'Manage Categories' && (
            <div>
              <h2 className="font-serif text-2xl mb-4">Categories</h2>
              <div className="flex gap-2 mb-4">
                <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="New category" className="border p-2 rounded flex-1" />
                <button onClick={addCategory} className="bg-amber text-white px-4 rounded-full">Add</button>
              </div>
              {editingCat && (
                <div className="flex gap-2 mb-4">
                  <input value={editingCat.name} onChange={e=>setEditingCat({...editingCat,name:e.target.value})} className="border p-2 rounded flex-1" />
                  <button onClick={renameCategory} className="bg-mocha text-white px-4 rounded-full">Save</button>
                  <button onClick={()=>setEditingCat(null)} className="px-4 rounded-full border">Cancel</button>
                </div>
              )}
              <ul className="space-y-2">
                {categories.map(c => (
                  <li key={c.id} className="flex justify-between items-center border p-2 rounded">
                    <span>{c.name} <span className="text-sm text-mocha/60">({items.filter(i=>i.category_id===c.id).length})</span></span>
                    <div className="flex gap-2">
                      <button onClick={()=>setEditingCat(c)} className="text-sm underline">Rename</button>
                      <button onClick={()=>deleteCategory(c.id)} className="text-sm text-red-600 underline">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              {categories.length === 0 && <p className="text-mocha/60">No categories.</p>}
            </div>
          )}
          {section === 'Manage Menu' && (
            <div>
              <h2 className="font-serif text-2xl mb-4">Menu Items</h2>
              <div className="grid gap-2 mb-4">
                <input value={itemForm.name} onChange={e=>setItemForm({...itemForm,name:e.target.value})} placeholder="Name" className="border p-2 rounded" />
                <input value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})} placeholder="Description" className="border p-2 rounded" />
                <input value={itemForm.price} onChange={e=>setItemForm({...itemForm,price:e.target.value})} placeholder="Price" className="border p-2 rounded" />
                <select value={itemForm.category_id} onChange={e=>setItemForm({...itemForm,category_id:e.target.value})} className="border p-2 rounded">
                  <option value="">Select category</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={itemForm.image_url} onChange={e=>setItemForm({...itemForm,image_url:e.target.value})} placeholder="Image URL" className="border p-2 rounded" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.available} onChange={e=>setItemForm({...itemForm,available:e.target.checked})} /> Available</label>
                <div className="flex gap-2">
                  <button onClick={saveItem} className="bg-amber text-white px-4 py-2 rounded-full">{editingItem?'Update':'Add'}</button>
                  {editingItem && <button onClick={()=>{setEditingItem(null);setItemForm({name:'',description:'',price:'',category_id:'',image_url:'',available:true})}} className="px-4 py-2 rounded-full border">Cancel</button>}
                </div>
              </div>
              <ul className="space-y-2">
                {items.map(it => (
                  <li key={it.id} className="border p-3 rounded flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{it.name} <span className="text-amber">₹{it.price}</span> {!it.available && <span className="text-red-600 text-xs">(unavailable)</span>}</p>
                      <p className="text-sm text-mocha/70">{it.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>toggleAvailable(it)} className="text-sm underline">{it.available?'Disable':'Enable'}</button>
                      <button onClick={()=>startEditItem(it)} className="text-sm underline">Edit</button>
                      <button onClick={()=>deleteItem(it.id)} className="text-sm text-red-600 underline">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              {items.length === 0 && <p className="text-mocha/60">No items.</p>}
            </div>
          )}
          {section === 'Manage Users' && (
            <div>
              <h2 className="font-serif text-2xl mb-4">Manage Users</h2>
              <div className="flex gap-2 mb-4">
                <input value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="Email" className="border p-2 rounded flex-1" />
                <input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="Temp password" className="border p-2 rounded flex-1" />
                <select value={adminRole} onChange={e=>setAdminRole(e.target.value)} className="border p-2 rounded">
                  <option value="admin">Admin</option>
                  <option value="chef">Chef</option>
                </select>
                <button onClick={async()=>{ if(!supabase) return; const {error}=await supabase.functions.invoke('manage-admins',{body:{action:'create',email:adminEmail,password:adminPassword,role:adminRole}}); if(error) setDataError(error.message); else { setAdminEmail(''); setAdminPassword(''); setAdminRole('admin'); loadData() } }} className="bg-amber text-white px-4 rounded-full">Create</button>
              </div>
              <ul className="space-y-2">
                {adminProfiles.map(p=>(
                  <li key={p.user_id} className="flex justify-between items-center border p-2 rounded">
                    <span>{p.email} <span className="text-xs text-mocha/60">({p.role})</span></span>
                    <button onClick={async()=>{ if(!supabase) return; if(p.user_id===session.user.id){ alert('Cannot delete yourself'); return } const {error}=await supabase.functions.invoke('manage-admins',{body:{action:'delete',userId:p.user_id}}); if(error) setDataError(error.message); else loadData() }} className="text-sm text-red-600 underline">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
