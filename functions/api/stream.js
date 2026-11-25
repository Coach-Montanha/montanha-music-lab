import { createDecipheriv } from "node:crypto";

let cachedScClientId = "Hpp4j7peQTPimFlKMjTX3y3mK2946b7y";
let scClientIdFetchedAt = 0;

async function getSoundCloudClientId(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedScClientId && now - scClientIdFetchedAt < 3600 * 1000) {
    return cachedScClientId;
  }
  try {
    const page = await fetch("https://soundcloud.com", { signal: AbortSignal.timeout(2500) }).then((r) => r.text());
    const scripts = [...page.matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
    for (const s of scripts.slice(-4)) {
      const js = await fetch(s, { signal: AbortSignal.timeout(2500) }).then((r) => r.text());
      const m = js.match(/client_id:"([a-zA-Z0-9]{32})"/);
      if (m && m[1]) {
        cachedScClientId = m[1];
        scClientIdFetchedAt = now;
        return cachedScClientId;
      }
    }
  } catch {}
  return cachedScClientId;
}

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
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
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

function isTitleMatch(candTitle, targetTitle) {
  if (!candTitle || !targetTitle) return false;
  const s = sanitizeTitle(candTitle).toLowerCase();
  const t = sanitizeTitle(targetTitle).toLowerCase();
  if (s === t) return true;
  if (s.includes(t) || t.includes(s)) return true;
  const sWords = s.split(" ").filter((w) => w.length > 2);
  const tWords = t.split(" ").filter((w) => w.length > 2);
  if (tWords.length === 0) return s === t;
  const common = sWords.filter((w) => tWords.includes(w));
  return common.length >= Math.min(2, tWords.length) && common.length / Math.max(tWords.length, 1) >= 0.6;
}

function isArtistMatch(candArtist, candidates) {
  if (!candidates || candidates.length === 0) return true;
  if (!candArtist) return false;
  const s = sanitizeTitle(candArtist).toLowerCase();
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
    "instrumental version", "cover version", "8-bit", "16-bit", "chiptune", "midi version",
    "slowed", "reverb", "nightcore", "sped up", "8d audio", "full album", "live at"
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
  const q = candidates.length > 0 ? `${cleanT} ${candidates[0]}`.trim() : cleanT;

  try {
    const url = "https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=" + encodeURIComponent(q) + "&p=0&n=6";
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(2500)
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
  return null;
}

async function resolveAudius(title, artist) {
  try {
    const q = encodeURIComponent(`${artist} ${title}`.trim());
    const search = await fetch(`https://api.audius.co/v1/tracks/search?query=${q}&app_name=montanha-music`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!search.ok) return null;
    const { data = [] } = await search.json();
    const hit = data.find((t) => t.is_streamable !== false && sameSong(title, artist, t));
    if (!hit) return null;
    const stream = await fetch(`https://api.audius.co/v1/tracks/${hit.id}/stream?no_redirect=true&app_name=montanha-music`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!stream.ok) return null;
    const { data: url } = await stream.json();
    return url ? { kind: "audio", url, duration: hit.duration || 210, source: "audius" } : null;
  } catch {
    return null;
  }
}

async function resolveSoundCloud(title, artist) {
  const cleanT = sanitizeTitle(title);
  if (!cleanT) return null;
  const candidates = extractArtistCandidates(artist);
  const q = `${candidates[0] || artist || ""} ${cleanT}`.trim();

  try {
    let clientId = await getSoundCloudClientId();
    let resp = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&limit=10&client_id=${clientId}`,
      { signal: AbortSignal.timeout(2800) }
    );
    if (resp.status === 401 || resp.status === 403) {
      clientId = await getSoundCloudClientId(true);
      resp = await fetch(
        `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&limit=10&client_id=${clientId}`,
        { signal: AbortSignal.timeout(2800) }
      );
    }
    if (!resp.ok) return null;
    const data = await resp.json();

    for (const item of data.collection || []) {
      if (item.policy !== "ALLOW" || !item.duration || item.duration < 60000 || item.duration > 600000) continue;
      if (isFakeCover(item.title, title)) continue;
      if (!isTitleMatch(item.title, cleanT)) continue;

      const haystack = `${item.title || ""} ${item.user?.username || ""} ${item.publisher_metadata?.artist || ""}`;
      if (candidates.length > 0 && !isArtistMatch(haystack, candidates)) continue;

      const transcodings = item.media?.transcodings || [];
      const prog = transcodings.find((x) => x.format?.protocol === "progressive");
      const hlsMp4 = transcodings.find((x) => x.format?.protocol === "hls" && x.format?.mime_type?.includes("mp4"));
      const hlsMp3 = transcodings.find((x) => x.format?.protocol === "hls" && x.format?.mime_type?.includes("mpeg"));
      const chosen = prog || hlsMp4 || hlsMp3 || transcodings[0];
      if (!chosen?.url) continue;

      const streamResp = await fetch(`${chosen.url}?client_id=${clientId}`, { signal: AbortSignal.timeout(2500) });
      if (!streamResp.ok) continue;
      const streamData = await streamResp.json();
      if (streamData?.url) {
        return {
          kind: "audio",
          url: streamData.url,
          duration: Math.round(item.duration / 1000),
          source: chosen.format?.protocol === "progressive" ? "soundcloud-mp3" : "soundcloud-hls"
        };
      }
    }
  } catch {}
  return null;
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
      signal: AbortSignal.timeout(3000)
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

export async function onRequest(context) { const { request } = context;
    const url = new URL(request.url);

    if (url.pathname === "/api/stream") {
      const title = (url.searchParams.get("title") || url.searchParams.get("t") || "").trim();
      const artist = (url.searchParams.get("artist") || url.searchParams.get("a") || "").trim();
      const youtubeId = (url.searchParams.get("youtubeId") || url.searchParams.get("id") || "").replace(/^yt-/, "").split("&")[0].trim();
      const quality = (url.searchParams.get("quality") || "high").trim();

      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      if (title || artist) {
        // EXECUÇÃO PARALELA ULTRA-RÁPIDA (< 1s): Dispara JioSaavn, SoundCloud e Audius juntos
        const [saavnRes, scRes, audiusRes] = await Promise.allSettled([
          resolveJioSaavn(title, artist, quality),
          resolveSoundCloud(title, artist),
          resolveAudius(title, artist)
        ]);

        const bestAudio =
          (saavnRes.status === "fulfilled" && saavnRes.value) ||
          (scRes.status === "fulfilled" && scRes.value) ||
          (audiusRes.status === "fulfilled" && audiusRes.value);

        if (bestAudio) {
          return new Response(JSON.stringify(bestAudio), { headers: corsHeaders });
        }
      }

      const ytRes = await resolveYouTube(title, artist, youtubeId);
      if (ytRes) return new Response(JSON.stringify(ytRes), { headers: corsHeaders });

      return new Response(JSON.stringify({ kind: "unavailable" }), { headers: corsHeaders });
    }

    if (url.pathname === "/api/youtube-search") {
      const q = (url.searchParams.get("q") || "").trim();
      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      };

      if (!q) {
        return new Response(JSON.stringify({ results: [] }), { headers: corsHeaders });
      }

      try {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        const ytResp = await fetch(ytSearchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
          },
          signal: AbortSignal.timeout(3000)
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
      } catch {}

      return new Response(JSON.stringify({ results: [] }), { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404 }); }
