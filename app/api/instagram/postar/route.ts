import { timingSafeEqual } from "node:crypto";
import { configurado, planejar, publicar } from "@/lib/instagram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Chamada pelo agendador a cada hora. Posta no Instagram, no máximo 1 por chamada, seguindo os horários
 * liberados do dia. Com ?simular=1 só mostra o que seria postado, sem publicar nada.
 */
export async function GET(req: Request) {
  if (!autorizado(req)) return Response.json({ erro: "acesso negado" }, { status: 401 });

  const q = new URL(req.url).searchParams;
  const simular = q.has("simular");
  // Só na simulação: ?hora=20 testa como se fossem 20h em Rio Branco
  const hora = simular && q.get("hora") ? Number(q.get("hora")) : undefined;
  try {
    const plano = await planejar(new Date(), hora);
    if (!plano.ok) return Response.json({ postou: false, motivo: plano.motivo });

    if (simular || !configurado()) {
      return Response.json({
        postou: false,
        simulacao: true,
        configurado: configurado(),
        materia: plano.article.title,
        imagem: plano.image,
        legenda: plano.caption,
        feitosHoje: plano.feitosHoje,
      });
    }

    const mediaId = await publicar(plano);
    return Response.json({ postou: true, mediaId, materia: plano.article.title });
  } catch (e) {
    console.error("instagram: postagem falhou", e);
    return Response.json({ postou: false, erro: e instanceof Error ? e.message : "erro" }, { status: 500 });
  }
}
