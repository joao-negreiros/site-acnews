/**
 * Foto numa moldura de tamanho fixo, sempre inteira (sem corte). Quando a proporção da foto
 * é diferente da moldura, as laterais são preenchidas com a própria foto ampliada e desfocada.
 * O tamanho da moldura vem de `className` (ex.: "aspect-video w-full").
 */
export function Photo({
  src,
  className = "",
  eager = false,
}: {
  src: string;
  className?: string;
  eager?: boolean;
}) {
  const loading = eager ? "eager" : "lazy";
  return (
    <div className={`relative overflow-hidden rounded bg-neutral-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading={loading} className="relative h-full w-full object-contain" />
    </div>
  );
}
