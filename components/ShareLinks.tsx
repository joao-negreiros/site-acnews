"use client";

import { useEffect, useState } from "react";
import { FaFacebookF, FaLink, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const btn =
  "flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition-colors hover:bg-brand hover:text-white";

/**
 * Links rápidos de compartilhamento. Só links e um botão de copiar: nenhum script de terceiros.
 * O endereço vem do próprio navegador, então vale para qualquer domínio do portal.
 */
export function ShareLinks({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: FaWhatsapp },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FaFacebookF },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, Icon: FaXTwitter },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, Icon: FaTelegram },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem permissão de área de transferência: nada a fazer */
    }
  }

  return (
    <div className="mt-4 flex min-h-9 items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Compartilhar</span>
      {url && (
        <>
          {links.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Compartilhar no ${name}`}
              className={btn}
            >
              <Icon size={15} />
            </a>
          ))}
          <button type="button" onClick={copy} aria-label="Copiar link" className={btn}>
            <FaLink size={14} />
          </button>
          {copied && <span className="text-xs text-neutral-500">Link copiado</span>}
        </>
      )}
    </div>
  );
}
