import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || (Deno.env.get('SUPABASE_SECRET_KEYS') || '').split(',')[0].trim()
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || (Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '').split(',')[0].trim()

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

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) return json({ error: 'Unauthorized' }, 401)
  const { data: profile } = await admin.from('admin_profiles').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!profile) return json({ error: 'Forbidden' }, 403)

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === 'create') {
    const { email, password } = body
    if (!email || !password) return json({ error: 'Missing fields' }, 400)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (createErr) return json({ error: createErr.message }, 400)
    const { error: profErr } = await admin.from('admin_profiles').insert({ user_id: created.user.id, email })
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
    const { count } = await admin.from('admin_profiles').select('*', { count: 'exact', head: true })
    if ((count || 0) <= 1) return json({ error: 'Last admin cannot be removed' }, 400)
    await admin.from('admin_profiles').delete().eq('user_id', userId)
    await admin.auth.admin.deleteUser(userId)
    return json({ ok: true }, 200)
  }

  return json({ error: 'Unknown action' }, 400)
})
