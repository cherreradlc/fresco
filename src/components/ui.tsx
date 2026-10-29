"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Íconos de línea, todos del mismo grosor. */
export function Icono({ nombre, size = 24 }: { nombre: keyof typeof PATHS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[nombre]}
    </svg>
  );
}

const PATHS = {
  inicio: <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  pedidos: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
  cobrar: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9 9.5c.3 2 2.2 4 4.5 4.6l1-1 1.8.8c-.2 1-1 1.6-2 1.6A6 6 0 0 1 8 9.2c0-1 .6-1.8 1.6-2l.8 1.8z" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  atras: <path d="M15 5l-7 7 7 7" />,
  camion: (
    <>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  clientes: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a3 3 0 0 1 0 5.5M18 14a5.5 5.5 0 0 1 3.5 5.5" />
    </>
  ),
  stock: <path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" />,
  resumen: <path d="M5 19V11M10 19V5M15 19v-6M20 19V9" />,
  tienda: <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />,
  finanzas: (
    <>
      <path d="M4 20h16M6 16v-5M10 16V8M14 16v-3M18 16V5" />
    </>
  ),
  telefono: <path d="M6 3h3l1.5 5-2 1.5a11 11 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z" />,
} as const;

const TABS = [
  { href: "/", label: "Inicio", icono: "inicio" as const },
  { href: "/pedidos", label: "Pedidos", icono: "pedidos" as const },
  { href: "/pedidos/nuevo", label: "Nuevo", icono: "mas" as const, grande: true },
  { href: "/cobrar", label: "Cobrar", icono: "cobrar" as const },
  { href: "/mas", label: "Más", icono: "menu" as const },
];

/** La pantalla de la app: título arriba, contenido y la barra de abajo. */
export function Pantalla({ titulo, atras, accion, children }: { titulo: string; atras?: string; accion?: ReactNode; children: ReactNode }) {
  const ruta = usePathname();
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-crema/90 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 backdrop-blur">
        {atras && (
          <Link href={atras} aria-label="Volver" className="toque -ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-cascara">
            <Icono nombre="atras" />
          </Link>
        )}
        <h1 className="flex-1 font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">{titulo}</h1>
        {accion}
      </header>
      <main className="flex-1 px-5 pb-32">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Secciones">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) => {
            // "Más" agrupa clientes, stock y resumen
            const activa =
              t.href === "/" ? ruta === "/"
              : t.href === "/pedidos" ? ruta === "/pedidos"
              : t.href === "/mas" ? ["/mas", "/clientes", "/stock", "/resumen", "/finanzas"].some((r) => ruta.startsWith(r))
              : ruta.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={activa ? "page" : undefined}
                  className={`toque flex flex-col items-center gap-1 py-2.5 text-[11.5px] font-medium ${activa ? "text-palta" : "text-tinta-suave"}`}
                >
                  {t.grande ? (
                    <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-yema text-tinta shadow-[0_8px_20px_-6px_rgb(244_181_42/0.8)]">
                      <Icono nombre="mas" size={28} />
                    </span>
                  ) : (
                    <Icono nombre={t.icono} />
                  )}
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Tarjeta({ children, className = "", fondo = "bg-white" }: { children: ReactNode; className?: string; fondo?: string }) {
  return <div className={`rounded-[20px] border border-linea p-4 ${fondo} ${className}`}>{children}</div>;
}

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "neutro" | "deuda" | "ok" | "yema" }) {
  const t = {
    neutro: "bg-cascara text-tinta-suave",
    deuda: "bg-deuda-clara text-deuda",
    ok: "bg-brote text-palta",
    yema: "bg-yema-clara text-[#8a5c00]",
  }[tono];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium ${t}`}>{children}</span>;
}

export function Titulo({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-[18px] font-semibold">{children}</h2>
      {accion}
    </div>
  );
}

/** Mientras se leen los datos del celular. */
export function Cargando() {
  return <div className="mt-10 h-32 animate-pulse rounded-[20px] bg-cascara" />;
}

/**
 * El estado de un pedido en dos líneas que se leen solas:
 * Entrega: pendiente / entregado · Pago: pagado / pagó una parte / fiado.
 */
export function EstadoPedido({ entregado, total, pagado }: { entregado: boolean; total: number; pagado: number }) {
  const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
  const debe = total - pagado;
  return (
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-[13.5px]">
      <dt className="text-tinta-suave">Entrega</dt>
      <dd>{entregado ? <Etiqueta tono="ok">✓ Entregado</Etiqueta> : <Etiqueta tono="yema">⏳ Pendiente</Etiqueta>}</dd>
      <dt className="text-tinta-suave">Pago</dt>
      <dd>
        {debe <= 0 ? (
          <Etiqueta tono="ok">✓ Pagado</Etiqueta>
        ) : pagado > 0 ? (
          <Etiqueta tono="deuda">Pagó {fmt(pagado)} · debe {fmt(debe)}</Etiqueta>
        ) : (
          <Etiqueta tono="deuda">Fiado · debe {fmt(debe)}</Etiqueta>
        )}
      </dd>
    </dl>
  );
}
