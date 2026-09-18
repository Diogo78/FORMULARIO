// GET /api/list
// Retorna todas as respostas salvas no KV. Protegido por senha (env.ADMIN_PASSWORD),
// enviada pelo cliente no header "Authorization: Bearer <senha>".
export async function onRequestGet(context) {
  const { request, env } = context;

  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");

  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const list = await env.SUBMISSIONS.list();
  const items = await Promise.all(
    list.keys.map(async (k) => {
      const value = await env.SUBMISSIONS.get(k.name);
      return value ? { id: k.name, ...JSON.parse(value) } : null;
    })
  );

  const results = items
    .filter(Boolean)
    .sort((a, b) => (a.recebidoEm < b.recebidoEm ? 1 : -1)); // mais recente primeiro

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
