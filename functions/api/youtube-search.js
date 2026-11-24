export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  const q = (url.searchParams.get("q") || "").trim();
  if (!q) {
    return new Response(JSON.stringify({ results: [] }), { headers: corsHeaders });
  }

  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    const ytResp = await fetch(ytSearchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (ytResp.ok) {
      const html = await ytResp.text();
      const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
      const seen = new Set();
      const results = [];
      for (const m of matches) {
        const id = m[1];
        if (!seen.has(id)) {
          seen.add(id);
          results.push({ id, title: q });
          if (results.length >= 10) break;
        }
      }
      return new Response(JSON.stringify({ results }), { headers: corsHeaders });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ results: [] }), { headers: corsHeaders });
}
