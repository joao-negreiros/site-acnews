/**
 * Foto numa moldura de tamanho fixo, sempre inteira (sem corte). Quando a proporção da foto
 * é diferente da moldura, as laterais são preenchidas com a própria foto ampliada e desfocada.
 * O tamanho da moldura vem de `className` (ex.: "aspect-video w-full").
 * `zoom`: a foto cresce um pouco quando o mouse passa sobre o elemento pai com a classe "group".
 */
export function Photo({
  src,
  className = "",
  eager = false,
  zoom = false,
}: {
  src: string;
  className?: string;
  eager?: boolean;
  zoom?: boolean;
}) {
  const loading = eager ? "eager" : "lazy";
  const motion = zoom
    ? "transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    : "";
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
      <img src={src} alt="" loading={loading} className={`relative h-full w-full object-contain ${motion}`} />
    </div>
  );
}
