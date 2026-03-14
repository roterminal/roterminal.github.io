const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ROBLOX_APIS: Record<string, string> = {
  users: 'https://users.roblox.com',
  catalog: 'https://catalog.roblox.com',
  economy: 'https://economy.roblox.com',
  inventory: 'https://inventory.roblox.com',
  thumbnails: 'https://thumbnails.roblox.com',
  games: 'https://games.roblox.com',
  search: 'https://apis.roblox.com/search-api',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api, path, params } = await req.json();

    if (!api || !ROBLOX_APIS[api]) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid API: ${api}. Valid: ${Object.keys(ROBLOX_APIS).join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = ROBLOX_APIS[api];
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}${path || ''}${queryString}`;

    console.log(`Proxying: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Roblox API error [${response.status}]:`, data);
      return new Response(
        JSON.stringify({ success: false, error: data.errors?.[0]?.message || `API returned ${response.status}`, data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
