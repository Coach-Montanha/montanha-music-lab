export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const title = (url.searchParams.get("title") || url.searchParams.get("t") || "").trim();
  const artist = (url.searchParams.get("artist") || url.searchParams.get("a") || "").trim();
  const youtubeId = (url.searchParams.get("youtubeId") || url.searchParams.get("id") || "").replace(/^yt-/, "").split("&")[0].trim();

  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
    return new Response(JSON.stringify({ kind: "youtube", videoId: youtubeId }), { headers: corsHeaders });
  }

  if (title || artist) {
    try {
      const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} official`)}`;
      const ytResp = await fetch(ytSearchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      if (ytResp.ok) {
        const html = await ytResp.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match && match[1]) {
          return new Response(JSON.stringify({ kind: "youtube", videoId: match[1] }), { headers: corsHeaders });
        }
      }
    } catch (e) {}
  }

  return new Response(JSON.stringify({ kind: "unavailable" }), { headers: corsHeaders });
}
