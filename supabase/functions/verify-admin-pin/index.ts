import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'PIN inválido' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const adminPin = Deno.env.get('ADMIN_PIN');
    
    if (!adminPin) {
      console.error('ADMIN_PIN não configurado');
      return new Response(
        JSON.stringify({ valid: false, error: 'Erro de configuração' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const isValid = pin === adminPin;

    return new Response(
      JSON.stringify({ valid: isValid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao verificar PIN:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro interno' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
