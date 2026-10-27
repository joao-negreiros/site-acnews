import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { Article } from "@/lib/feeds";
import { fitHeadline, postText, wrapSub } from "@/lib/post";

/** Imagem do post (1080x1350, 4:5) no modelo do AC News, entregue em JPEG, que é o formato que o Instagram aceita. */

const W = 1080;
const H = 1350;
const X = 72;
const MAXW = 938;
const PHOTO = { top: 37, height: 710 };
const TEXT = { top: 770, bottom: 1215 };

const dataUri = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString("base64")}`;

export async function renderPostJpeg(a: Article): Promise<Buffer> {
  if (!a.image) throw new Error("matéria sem foto");

  // A foto é baixada aqui e recortada para a faixa do modelo (aceita JPG, PNG e WebP)
  const res = await fetch(a.image, { headers: { "User-Agent": "PortalNoticias/1.0" } });
  if (!res.ok) throw new Error(`foto indisponível (${res.status})`);
  const photo = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(W, PHOTO.height, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const { head, sub } = postText(a);
  // Prefere 2 linhas grandes; se não couber, 3 e, por último, 4 linhas menores
  let fit = fitHeadline(head, MAXW, 2, 100, 84);
  if (fit.lines.length > 2) fit = fitHeadline(head, MAXW, 3, 100, 72);
  if (fit.lines.length > 3) fit = fitHeadline(head, MAXW, 4, 72, 58);
  const lead = Math.round(fit.size * 0.98);
  const subSize = 38;
  const subLead = 47;
  const subLines = sub ? wrapSub(sub, MAXW, subSize) : [];

  const blockH = fit.lines.length * lead + (subLines.length ? 34 + subLines.length * subLead : 0);
  const top = Math.round(TEXT.top + (TEXT.bottom - TEXT.top - blockH) / 2);

  const png = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#fcfcfc", fontFamily: "Inter" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri(readFileSync(join(process.cwd(), "assets/frame.png")), "image/png")} alt="" width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri(photo, "image/jpeg")} alt="" width={W} height={PHOTO.height} style={{ position: "absolute", left: 0, top: PHOTO.top }} />
        <div style={{ position: "absolute", left: X, top, width: MAXW, display: "flex", flexDirection: "column" }}>
          {fit.lines.map((line, i) => (
            <div key={i} style={{ display: "flex", columnGap: fit.gap, height: lead, fontSize: fit.size, fontWeight: 900, letterSpacing: -fit.size * 0.022, color: "#0a0a0a", lineHeight: 1 }}>
              {line.split(" ").map((w, j) => (
                <span key={j}>{w}</span>
              ))}
            </div>
          ))}
          {subLines.map((line, i) => (
            <div key={i} style={{ display: "flex", marginTop: i === 0 ? 34 : 0, height: subLead, fontSize: subSize, fontWeight: 500, letterSpacing: -subSize * 0.01, color: "#1a1a1a", lineHeight: 1 }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Inter", data: readFileSync(join(process.cwd(), "assets/fonts/inter-900.woff")), weight: 900, style: "normal" },
        { name: "Inter", data: readFileSync(join(process.cwd(), "assets/fonts/inter-500.woff")), weight: 500, style: "normal" },
      ],
    },
  );

  return sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 92 }).toBuffer();
}
