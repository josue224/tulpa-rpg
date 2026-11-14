// Tulpa RPG · Perseus IA
// Recebe {system, messages} do site (usuário logado) e responde usando o Gemini.
// A chave fica no segredo GEMINI_API_KEY (Edge Functions > Secrets) e nunca vai para o navegador.
// Opcional: PERSEUS_MODELS = lista de modelos separados por vírgula, do melhor para o reserva.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const MODELS = (Deno.env.get("PERSEUS_MODELS") ||
  "gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite")
  .split(",").map((s) => s.trim()).filter(Boolean);

const cooldown = new Map<string, number>(); // modelo -> até quando pular (cota esgotada ou indisponível)
const hits = new Map<string, number[]>(); // usuário -> horários das últimas perguntas
const PER_MINUTE = 10;

function publishableKey(req: Request): string {
  const h = req.headers.get("apikey");
  if (h) return h;
  try {
    const k = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    if (k.default) return k.default;
  } catch (_) { /* ignora */ }
  return Deno.env.get("SUPABASE_ANON_KEY") || "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  // 1) Só usuários logados no Tulpa RPG
  const auth = req.headers.get("Authorization") || "";
  if (!/^Bearer\s+ey/.test(auth)) return json({ error: "Entre na sua conta para usar a IA." }, 401);
  let userId = "";
  try {
    const u = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: { Authorization: auth, apikey: publishableKey(req) },
    });
    if (!u.ok) return json({ error: "Sessão inválida. Entre de novo na conta." }, 401);
    userId = (await u.json())?.id || "";
  } catch (_) {
    return json({ error: "Não consegui conferir a sessão." }, 401);
  }
  if (!userId) return json({ error: "Sessão inválida. Entre de novo na conta." }, 401);

  // 2) Limite por pessoa
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < 60_000);
  if (recent.length >= PER_MINUTE) return json({ error: "Muitas perguntas seguidas. Espere um minuto." }, 429);
  recent.push(now);
  hits.set(userId, recent);

  // 3) Entrada
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "IA do servidor ainda não configurada (falta o segredo GEMINI_API_KEY)." }, 503);
  let body: { system?: unknown; messages?: unknown };
  try { body = await req.json(); } catch (_) { return json({ error: "Pedido inválido." }, 400); }
  const system = String(body.system || "").slice(0, 14000);
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-12)
    .map((m: { role?: string; content?: unknown }) => ({
      role: m?.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m?.content || "").slice(0, 3000) }],
    }))
    .filter((m) => m.parts[0].text.trim());
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Pergunta vazia." }, 400);
  while (messages.length && messages[0].role !== "user") messages.shift();

  // 4) Tenta do melhor modelo para o reserva
  let last = "sem modelos disponíveis";
  for (const model of MODELS) {
    if ((cooldown.get(model) || 0) > now) { last = `${model}: cota esgotada`; continue; }
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 25_000);
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        signal: ctl.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents: messages,
          generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
        }),
      }).finally(() => clearTimeout(timer));
      if (r.status === 429) {
        const t = await r.text();
        cooldown.set(model, now + (/per\s*day|perday/i.test(t) ? 60 : 2) * 60_000);
        last = `${model}: cota esgotada`;
        continue;
      }
      if (r.status === 400 || r.status === 403) {
        const t = await r.text();
        if (/api key|API_KEY|permission/i.test(t)) return json({ error: "A chave do Gemini foi recusada pelo Google. Confira o segredo GEMINI_API_KEY." }, 502);
        last = `${model}: HTTP ${r.status}`;
        continue;
      }
      if (r.status === 404) { cooldown.set(model, now + 6 * 3600_000); last = `${model}: não existe mais`; continue; }
      if (!r.ok) { last = `${model}: HTTP ${r.status}`; continue; }
      const j = await r.json();
      const reply = (j?.candidates?.[0]?.content?.parts || [])
        .filter((p: { thought?: boolean }) => !p?.thought)
        .map((p: { text?: string }) => p?.text || "").join("").trim();
      if (!reply) { last = `${model}: resposta vazia`; continue; }
      return json({ reply, model });
    } catch (e) {
      last = `${model}: ${(e as Error)?.name === "AbortError" ? "tempo esgotado" : "falha de rede"}`;
    }
  }
  return json({ error: `A IA não respondeu agora (${last}).` }, 503);
});
