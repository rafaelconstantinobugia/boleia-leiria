import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function truncate(text: string | null | undefined, maxLen: number): string {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

function joinFlags(flags: string[] | null | undefined): string {
  if (!flags || !Array.isArray(flags)) return ''
  return flags.filter(Boolean).join(',')
}

async function fetchWithRetry(url: string, body: Record<string, unknown>, retries = 2): Promise<Response> {
  const delays = [250, 1000]
  let lastError: Error | null = null

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.ok) return response
      const text = await response.text()
      lastError = new Error(`HTTP ${response.status}: ${text}`)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }

    if (i < retries) {
      await new Promise(r => setTimeout(r, delays[i] || 1000))
    }
  }

  throw lastError || new Error('fetchWithRetry failed')
}

function buildUnifiedPayload(
  tipo: string,
  record: Record<string, unknown>,
  apiKey: string,
  adminBaseUrl: string
): Record<string, unknown> {
  const tab = tipo === 'PEDIDO' ? 'pedidos' : tipo === 'OFERTA' ? 'ofertas' : 'matches'
  return {
    api_key: apiKey,
    entity_id: String(record.id || ''),
    tipo,
    created_at: record.created_at || new Date().toISOString(),
    updated_at: record.updated_at || '',
    status: record.status || '',
    // Pedido fields
    requester_name: record.requester_name || '',
    requester_phone: record.requester_phone || '',
    zone_from: record.pickup_location_text || '',
    zone_to: record.dropoff_location_text || '',
    pickup_lat: record.pickup_lat ?? '',
    pickup_lng: record.pickup_lng ?? '',
    dropoff_lat: record.dropoff_lat ?? '',
    dropoff_lng: record.dropoff_lng ?? '',
    qty: record.passengers ?? '',
    needs: joinFlags(record.special_needs as string[] | null),
    matched_offer_id: record.matched_offer_id || '',
    // Oferta fields
    driver_name: record.driver_name || '',
    driver_phone: record.driver_phone || '',
    departure_area: record.departure_area_text || '',
    vehicle_type: record.vehicle_type || '',
    seats_available: record.seats_available ?? '',
    can_go_distance: record.can_go_distance || '',
    equipment: joinFlags(record.equipment as string[] | null),
    // Match fields
    request_id: record.request_id || '',
    offer_id: record.offer_id || '',
    coordinator_name: record.coordinator_name || '',
    coordinator_phone: record.coordinator_phone || '',
    // Common
    window_start: record.window_start || record.time_window_start || '',
    window_end: record.window_end || record.time_window_end || '',
    notes: record.notes || '',
    source: 'lovable',
    link: `${adminBaseUrl}/coordenacao?tab=${tab}&id=${record.id}`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const sheetsEnabled = Deno.env.get('SHEETS_ENABLED')
    if (sheetsEnabled === 'false') {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'SHEETS_ENABLED=false' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const webhookUrl = Deno.env.get('GOOGLE_SHEETS_WEBHOOK_URL')
    if (!webhookUrl) throw new Error('GOOGLE_SHEETS_WEBHOOK_URL is not configured')

    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY')
    if (!apiKey) throw new Error('GOOGLE_SHEETS_API_KEY is not configured')

    const adminBaseUrl = Deno.env.get('ADMIN_BASE_URL') || 'https://boleia-leiria.lovable.app'

    const body = await req.json()
    const { type, record, pin } = body

    // --- BULK SYNC MODE (admin only, incremental) ---
    if (type === 'bulk_sync') {
      const adminPin = Deno.env.get('ADMIN_PIN')
      if (!adminPin || pin !== adminPin) {
        return new Response(JSON.stringify({ success: false, error: 'PIN inválido' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceRoleKey)

      // Fetch ALL requests (overwrite mode)
      const { data: requests, error: reqErr } = await supabase
        .from('ride_requests')
        .select('*')
        .order('created_at', { ascending: true })

      if (reqErr) throw reqErr

      // Fetch ALL offers (overwrite mode)
      const { data: offers, error: offErr } = await supabase
        .from('ride_offers')
        .select('*')
        .order('created_at', { ascending: true })

      if (offErr) throw offErr

      // Fetch ALL matches (overwrite mode)
      const { data: matchRows, error: matchErr } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true })

      if (offErr) throw offErr

      if (matchErr) throw matchErr

      let syncedRequests = 0
      let syncedOffers = 0
      let syncedMatches = 0
      const now = new Date().toISOString()

      // Sync requests
      for (const r of requests || []) {
        try {
          const payload = buildUnifiedPayload('PEDIDO', r as Record<string, unknown>, apiKey, adminBaseUrl)
          await fetchWithRetry(webhookUrl, payload)
          await supabase.from('ride_requests').update({ sheets_synced_at: now }).eq('id', r.id)
          syncedRequests++
        } catch (e) {
          console.error(`Failed to sync request ${r.id}:`, e instanceof Error ? e.message : e)
        }
      }

      // Sync offers
      for (const o of offers || []) {
        try {
          const payload = buildUnifiedPayload('OFERTA', o as Record<string, unknown>, apiKey, adminBaseUrl)
          await fetchWithRetry(webhookUrl, payload)
          await supabase.from('ride_offers').update({ sheets_synced_at: now }).eq('id', o.id)
          syncedOffers++
        } catch (e) {
          console.error(`Failed to sync offer ${o.id}:`, e instanceof Error ? e.message : e)
        }
      }

      // Sync matches
      for (const m of matchRows || []) {
        try {
          const payload = buildUnifiedPayload('MATCH', m as Record<string, unknown>, apiKey, adminBaseUrl)
          await fetchWithRetry(webhookUrl, payload)
          syncedMatches++
        } catch (e) {
          console.error(`Failed to sync match ${m.id}:`, e instanceof Error ? e.message : e)
        }
      }

      return new Response(JSON.stringify({
        success: true,
        synced: { requests: syncedRequests, offers: syncedOffers, matches: syncedMatches },
        total: { requests: requests?.length || 0, offers: offers?.length || 0, matches: matchRows?.length || 0 },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- SINGLE RECORD SYNC (automatic triggers) ---
    let payload: Record<string, unknown>

    if (type === 'offer') {
      payload = buildUnifiedPayload('OFERTA', record, apiKey, adminBaseUrl)
    } else if (type === 'request') {
      payload = buildUnifiedPayload('PEDIDO', record, apiKey, adminBaseUrl)
    } else if (type === 'match') {
      payload = buildUnifiedPayload('MATCH', record, apiKey, adminBaseUrl)
    } else {
      throw new Error(`Unknown type: ${type}`)
    }

    const response = await fetchWithRetry(webhookUrl, payload)
    const result = await response.json()

    // Mark as synced (for single record sync, use service role)
    if (type === 'request' || type === 'offer') {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceRoleKey)
        const table = type === 'request' ? 'ride_requests' : 'ride_offers'
        await supabase.from(table).update({ sheets_synced_at: new Date().toISOString() }).eq('id', record.id)
      } catch (e) {
        console.error('Failed to mark as synced:', e instanceof Error ? e.message : e)
      }
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error instanceof Error ? error.message : 'Unknown error')
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
