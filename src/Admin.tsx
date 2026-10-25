import { useState, useEffect } from 'react'
import { supabase, isConfigured } from './supabase'

export default function Admin() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [section, setSection] = useState('Overview')

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) { setIsAdmin(null); return }
    supabase.from('admin_profiles').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [session])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }
  async function logout() { if (supabase) await supabase.auth.signOut() }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-cream text-mocha p-8">
        <h1 className="font-serif text-3xl mb-4">Admin setup required</h1>
        <p>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env. See .env.example and supabase/schema.sql.</p>
      </div>
    )
  }

  if (!session || isAdmin === false) {
    if (session && isAdmin === false) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="mb-4">Not authorized.</p>
            <button onClick={logout} className="bg-mocha text-cream px-4 py-2 rounded-full">Logout</button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
          <h1 className="font-serif text-2xl text-mocha mb-4">Admin Login</h1>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded mb-3" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded mb-3" />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button className="w-full bg-mocha text-cream py-2 rounded-full">Sign In</button>
        </form>
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
          {['Overview','Manage Menu','Manage Categories','Manage Admin Users'].map(s=>(
            <button key={s} onClick={()=>setSection(s)} className={`block w-full text-left px-3 py-2 rounded ${section===s?'bg-mocha text-cream':'hover:bg-champagne/40'}`}>{s}</button>
          ))}
        </aside>
        <main className="md:col-span-3 bg-white rounded-2xl p-6 shadow">
          <h2 className="font-serif text-2xl mb-4">{section}</h2>
          <p>Connect Supabase tables to manage data. See supabase/schema.sql for required schema.</p>
        </main>
      </div>
    </div>
  )
}
