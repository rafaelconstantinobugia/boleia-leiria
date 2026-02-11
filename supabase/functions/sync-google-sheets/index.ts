import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const webhookUrl = Deno.env.get('GOOGLE_SHEETS_WEBHOOK_URL')
    if (!webhookUrl) {
      throw new Error('GOOGLE_SHEETS_WEBHOOK_URL is not configured')
    }

    const { type, record } = await req.json()

    let row: (string | number | null)[]

    if (type === 'offer') {
      row = [
        record.id,
        record.driver_name,
        record.driver_phone,
        record.departure_area_text,
        record.vehicle_type,
        record.seats_available,
        record.time_window_start,
        record.time_window_end,
        record.can_go_distance,
        (record.equipment || []).join(', '),
        record.notes || '',
        record.status,
        record.created_at,
        record.updated_at,
      ]
    } else {
      row = [
        record.id,
        record.requester_name,
        record.requester_phone,
        record.pickup_location_text,
        record.dropoff_location_text,
        record.passengers,
        record.window_start,
        record.window_end,
        (record.special_needs || []).join(', '),
        record.notes || '',
        record.status,
        record.created_at,
        record.updated_at,
      ]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, row }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Google Sheets webhook failed [${response.status}]: ${text}`)
    }

    await response.text()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
