import { createDecipheriv } from "node:crypto";

const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function sameSong(title, artist, cand) {
  const t = norm(title);
  const a = norm(artist);
  const ct = norm(cand.title || "");
  const ca = norm(cand.user?.name || "");
  return Boolean(t && ct.includes(t) && ca && (ca.includes(a) || a.includes(ca)));
}

function sanitizeTitle(str) {
  return (str || "")
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/feat\..*$/i, "")
    .replace(/ft\..*$/i, "")
    .replace(/[^\p{L}\p{N}\s\x27-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractArtistCandidates(artistStr) {
  if (!artistStr) return [];
  const normalized = artistStr.replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ");
  const rawList = normalized
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map((a) => sanitizeTitle(a))
    .filter((a) => a.length > 1);

  const candidates = [];
  const cleanedFull = sanitizeTitle(normalized);
  if (cleanedFull && !candidates.includes(cleanedFull)) {
    candidates.push(cleanedFull);
  }
  for (const a of rawList) {
    if (!candidates.includes(a)) candidates.push(a);
  }
  return candidates.length > 0 ? candidates : [normalized.trim()];
}

function isTitleMatch(saavnTitle, targetTitle) {
  if (!saavnTitle || !targetTitle) return false;
  const s = sanitizeTitle(saavnTitle).toLowerCase();
  const t = sanitizeTitle(targetTitle).toLowerCase();
  if (s === t) return true;
  if (s.includes(t) || t.includes(s)) return true;
  const sWords = s.split(" ").filter((w) => w.length > 2);
  const tWords = t.split(" ").filter((w) => w.length > 2);
  if (tWords.length === 0) return s === t;
  const common = sWords.filter((w) => tWords.includes(w));
  return common.length >= Math.min(2, tWords.length) && common.length / Math.max(tWords.length, 1) >= 0.6;
}

function isArtistMatch(saavnArtist, candidates) {
  if (!candidates || candidates.length === 0) return true;
  if (!saavnArtist) return false;
  const s = sanitizeTitle(saavnArtist).toLowerCase();
  for (const cand of candidates) {
    const c = cand.toLowerCase();
    if (!c) continue;
    if (s.includes(c) || c.includes(s)) return true;
    const sWords = s.split(" ").filter((w) => w.length > 2);
    const cWords = c.split(" ").filter((w) => w.length > 2);
    if (cWords.length > 0 && cWords.every((w) => sWords.includes(w))) return true;
  }
  return false;
}

function isFakeCover(title, query) {
  if (!title) return false;
  const lower = title.toLowerCase();
  const qLower = (query || "").toLowerCase();
  const badMarkers = [
    "karaoke", "tribute", "originally performed by", "in the style of",
    "instrumental version", "cover version", "8-bit", "16-bit", "chiptune", "midi version"
  ];
  return badMarkers.some((m) => lower.includes(m) && !qLower.includes(m));
}

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

async function resolveJioSaavn(title, artist, quality = "high") {
  const cleanT = sanitizeTitle(title);
  if (!cleanT) return null;
  const candidates = extractArtistCandidates(artist);
  const bitrateSuffix = quality === "economy" ? "_96" : quality === "standard" ? "_160" : "_320";

  const queries = [];
  if (candidates.length > 0) {
    queries.push(`${cleanT} ${candidates[0]}`.trim());
  }
  queries.push(cleanT);

  for (const q of queries.slice(0, 2)) {
    try {
      const url = "https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=" + encodeURIComponent(q) + "&p=0&n=6";
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = data.results || [];
        for (const item of results) {
          if (!isTitleMatch(item.title, cleanT)) continue;
          if (isFakeCover(item.title, cleanT)) continue;

          const itemArtist = item.more_info?.artistMap?.primary_artists?.[0]?.name || item.more_info?.music || item.subtitle || "";
          if (candidates.length > 0 && !isArtistMatch(itemArtist, candidates)) continue;

          const enc = item.more_info?.encrypted_media_url;
          if (enc) {
            const raw = decryptSaavnMediaUrl(enc);
            if (raw && raw.includes("saavncdn.com")) {
              const streamUrl = raw.replace(/_\d+\.mp4$/, `${bitrateSuffix}.mp4`);
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
    const hit = data.find((t) => t.is_streamable !== false && sameSong(title, artist, t));
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
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} official audio`)}`;
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
  const quality = (url.searchParams.get("quality") || "high").trim();

  if (title || artist) {
    const saavnRes = await resolveJioSaavn(title, artist, quality);
    if (saavnRes) {
      return new Response(JSON.stringify(saavnRes), { headers: corsHeaders });
    }

    const audiusRes = await resolveAudius(title, artist);
    if (audiusRes) {
      return new Response(JSON.stringify(audiusRes), { headers: corsHeaders });
    }
  }

  const ytRes = await resolveYouTube(title, artist, youtubeId);
  if (ytRes) {
    return new Response(JSON.stringify(ytRes), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ kind: "unavailable" }), { headers: corsHeaders });
}
