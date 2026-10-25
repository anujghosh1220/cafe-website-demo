import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || (Deno.env.get('SUPABASE_SECRET_KEYS') || '').split(',')[0].trim()
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || (Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '').split(',')[0].trim()

const admin = createClient(supabaseUrl, serviceRole)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') || ''
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  const { data: profile } = await admin.from('admin_profiles').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!profile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === 'create') {
    const { email, password } = body
    if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
    const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (createErr) return new Response(JSON.stringify({ error: createErr.message }), { status: 400 })
    const { error: profErr } = await admin.from('admin_profiles').insert({ user_id: created.user.id, email })
    if (profErr) {
      await admin.auth.admin.deleteUser(created.user.id)
      return new Response(JSON.stringify({ error: profErr.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  if (action === 'delete') {
    const { userId } = body
    if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 })
    if (userId === user.id) return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), { status: 400 })
    const { count } = await admin.from('admin_profiles').select('*', { count: 'exact', head: true })
    if ((count || 0) <= 1) return new Response(JSON.stringify({ error: 'Last admin cannot be removed' }), { status: 400 })
    await admin.from('admin_profiles').delete().eq('user_id', userId)
    await admin.auth.admin.deleteUser(userId)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 })
})
