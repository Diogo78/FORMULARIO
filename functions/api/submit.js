// POST /api/submit
// Recebe os dados do formulário e salva no KV namespace "SUBMISSIONS".
export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validação simples dos campos esperados
  const required = ["nome", "cidade", "estilo", "instagram", "experiencia", "material"];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== "string") {
      return new Response(JSON.stringify({ error: `Campo ausente: ${field}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const now = new Date();
  const id = `${now.toISOString()}-${crypto.randomUUID()}`;

  const record = {
    nome: data.nome.trim(),
    cidade: data.cidade.trim(),
    estilo: data.estilo.trim(),
    instagram: data.instagram.trim(),
    experiencia: data.experiencia.trim(),
    material: data.material.trim(),
    recebidoEm: now.toISOString(),
  };

  try {
    await env.SUBMISSIONS.put(id, JSON.stringify(record));
  } catch (e) {
    return new Response(JSON.stringify({ error: "Falha ao salvar" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
