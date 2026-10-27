import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SOCIAL } from "@/lib/site";

const ICONS = {
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  YouTube: FaYoutube,
} as const;

/** Ícones das redes do portal. Sem `href` em lib/site.ts, o ícone aparece sem link. */
export function SocialIcons({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIAL.map((s) => {
        const Icon = ICONS[s.name];
        return (
          <li key={s.name}>
            {s.href ? (
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="block hover:text-brand"
              >
                <Icon size={size} />
              </a>
            ) : (
              <span aria-hidden className="block opacity-60">
                <Icon size={size} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
