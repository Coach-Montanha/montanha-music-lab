import { createDecipheriv } from "node:crypto";

function decryptSaavnMediaUrl(encryptedMediaUrl) {
  if (!encryptedMediaUrl) return "";
  try {
    const singleKey = Buffer.from("38346591", "utf8");
    const tripleKey = Buffer.concat([singleKey, singleKey, singleKey]);
    const decipher = createDecipheriv("des-ede3-ecb", tripleKey, null);
    decipher.setAutoPadding(true);
    let dec = decipher.update(encryptedMediaUrl, "base64", "utf8");
    dec += decipher.final("utf8");
    return dec.trim().replace("http:", "https:");
  } catch {
    return "";
  }
}

async function resolveJioSaavn(title, artist) {
  if (!title && !artist) return null;
  const queries = [
    (artist ? artist + " " : "") + title,
    title
  ];

  for (const q of queries) {
    try {
      const url = "https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=" + encodeURIComponent(q) + "&p=0&n=5";
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(3500)
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = data.results || [];
        for (const item of results) {
          if (item.more_info?.encrypted_media_url) {
            const raw = decryptSaavnMediaUrl(item.more_info.encrypted_media_url);
            if (raw && raw.includes("saavncdn.com")) {
              const streamUrl = raw.replace(/_\d+\.mp4$/, "_320.mp4");
              const duration = Number(item.more_info?.duration) || 210;
              return { kind: "audio", url: streamUrl, duration, source: "saavn-320" };
            }
          }
        }
      }
    } catch {}
  }
  return null;
}

async function resolveAudius(title, artist) {
  try {
    const q = encodeURIComponent(`${artist} ${title}`.trim());
    const search = await fetch(`https://api.audius.co/v1/tracks/search?query=${q}&app_name=montanha-music`, {
      signal: AbortSignal.timeout(3000)
    });
    if (!search.ok) return null;
    const { data = [] } = await search.json();
    const hit = data.find((t) => t.is_streamable !== false);
    if (!hit) return null;
    const stream = await fetch(`https://api.audius.co/v1/tracks/${hit.id}/stream?no_redirect=true&app_name=montanha-music`, {
      signal: AbortSignal.timeout(3000)
    });
    if (!stream.ok) return null;
    const { data: url } = await stream.json();
    return url ? { kind: "audio", url, duration: hit.duration || 210, source: "audius" } : null;
  } catch {
    return null;
  }
}

async function resolveYouTube(title, artist, knownId) {
  if (knownId && /^[a-zA-Z0-9_-]{11}$/.test(knownId)) {
    return { kind: "youtube", videoId: knownId };
  }
  if (!title && !artist) return null;

  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} official`)}`;
    const ytResp = await fetch(ytSearchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      signal: AbortSignal.timeout(3500)
    });
    if (ytResp.ok) {
      const html = await ytResp.text();
      const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match && match[1]) {
        return { kind: "youtube", videoId: match[1] };
      }
    }
  } catch {}
  return null;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=86400, s-maxage=604800"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const title = (url.searchParams.get("title") || url.searchParams.get("t") || "").trim();
  const artist = (url.searchParams.get("artist") || url.searchParams.get("a") || "").trim();
  const youtubeId = (url.searchParams.get("youtubeId") || url.searchParams.get("id") || "").replace(/^yt-/, "").split("&")[0].trim();

  // 1. Tenta JioSaavn 320kbps (Áudio Direto Akamai - Toca em Segundo Plano sem cortes)
  if (title || artist) {
    const saavnRes = await resolveJioSaavn(title, artist);
    if (saavnRes) {
      return new Response(JSON.stringify(saavnRes), { headers: corsHeaders });
    }
  }

  // 2. Tenta Audius Open API (Áudio Direto MP3)
  if (title || artist) {
    const audiusRes = await resolveAudius(title, artist);
    if (audiusRes) {
      return new Response(JSON.stringify(audiusRes), { headers: corsHeaders });
    }
  }

  // 3. Fallback YouTube Adapter
  const ytRes = await resolveYouTube(title, artist, youtubeId);
  if (ytRes) {
    return new Response(JSON.stringify(ytRes), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ kind: "unavailable" }), { headers: corsHeaders });
}
