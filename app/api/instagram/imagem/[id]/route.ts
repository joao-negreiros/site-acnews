import { getArticle } from "@/lib/feeds";
import { assinaturaOk } from "@/lib/instagram";
import { renderPostJpeg } from "@/lib/postImage";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Imagem do post em JPEG. Só responde a endereços assinados (a Meta baixa a imagem por aqui). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sig = new URL(req.url).searchParams.get("s") ?? "";
  if (!assinaturaOk(id, sig)) return new Response("Acesso negado", { status: 401 });

  const a = await getArticle(id);
  if (!a?.image) return new Response("Matéria sem foto", { status: 404 });

  try {
    const jpeg = await renderPostJpeg(a);
    return new Response(new Uint8Array(jpeg), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" },
    });
  } catch (e) {
    console.error("instagram: imagem falhou", e);
    return new Response("Falha ao gerar a imagem", { status: 502 });
  }
}
