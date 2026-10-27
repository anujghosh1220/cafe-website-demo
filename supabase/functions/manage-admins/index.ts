import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function resolveSecretKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy
  const single = Deno.env.get('SUPABASE_SECRET_KEY')
  if (single) return single
  const raw = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'string') return parsed
      if (Array.isArray(parsed)) {
        const first = parsed.find((v) => typeof v === 'string' || (v && typeof v.secret === 'string'))
        if (typeof first === 'string') return first
        if (first && typeof first.secret === 'string') return first.secret
      }
      if (parsed && typeof parsed === 'object') {
        for (const value of Object.values(parsed)) {
          if (typeof value === 'string') return value
          if (value && typeof (value as any).secret === 'string') return (value as any).secret
        }
      }
    } catch {
      return raw.split(',')[0].trim()
    }
  }
  return ''
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = resolveSecretKey()

const admin = createClient(supabaseUrl, serviceRole)

const ALLOWED_ORIGIN = 'https://cafe-website-demo-livid.vercel.app'
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (!serviceRole) {
    console.error('Missing privileged Supabase secret key')
    return json({ error: 'Server misconfigured' }, 500)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) {
    console.error('Invalid or missing user token', userErr?.message)
    return json({ error: 'Unauthorized' }, 401)
  }
  const { data: profile } = await admin.from('admin_profiles').select('user_id,role').eq('user_id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') return json({ error: 'Forbidden' }, 403)

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === 'create') {
    const { email, password, role } = body
    if (!email || !password) return json({ error: 'Missing fields' }, 400)
    const userRole = role === 'chef' ? 'chef' : role === 'admin' ? 'admin' : null
    if (!userRole) return json({ error: 'Invalid role' }, 400)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (createErr) return json({ error: createErr.message }, 400)
    const { error: profErr } = await admin.from('admin_profiles').insert({ user_id: created.user.id, email, role: userRole })
    if (profErr) {
      await admin.auth.admin.deleteUser(created.user.id)
      return json({ error: profErr.message }, 400)
    }
    return json({ ok: true }, 200)
  }

  if (action === 'delete') {
    const { userId } = body
    if (!userId) return json({ error: 'Missing userId' }, 400)
    if (userId === user.id) return json({ error: 'Cannot delete yourself' }, 400)
    const { count } = await admin.from('admin_profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
    if ((count || 0) <= 1) return json({ error: 'Last admin cannot be removed' }, 400)
    await admin.from('admin_profiles').delete().eq('user_id', userId)
    await admin.auth.admin.deleteUser(userId)
    return json({ ok: true }, 200)
  }

  return json({ error: 'Unknown action' }, 400)
})
