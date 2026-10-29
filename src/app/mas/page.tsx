"use client";

import Link from "next/link";
import { Icono, Pantalla } from "@/components/ui";
import { useDatos } from "@/lib/datos";

const SECCIONES = [
  { href: "/finanzas", icono: "finanzas" as const, titulo: "Finanzas y SII", texto: "Facturas, resultados, proyección y libros" },
  { href: "/clientes", icono: "clientes" as const, titulo: "Clientes", texto: "Fichas, historial y quién dejó de comprar" },
  { href: "/stock", icono: "stock" as const, titulo: "Stock", texto: "Cuánto queda y lo que llega" },
  { href: "/resumen", icono: "resumen" as const, titulo: "Resumen", texto: "Ventas del mes y mejores clientes" },
  { href: "/catalogo", icono: "tienda" as const, titulo: "Mi página para clientes", texto: "Lo que ven tus clientes para pedir" },
];

export default function Mas() {
  const { reiniciar } = useDatos();
  return (
    <Pantalla titulo="Más">
      <ul className="flex flex-col gap-2.5">
        {SECCIONES.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="toque flex items-center gap-4 rounded-[18px] border border-linea bg-white px-4 py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brote text-palta"><Icono nombre={s.icono} /></span>
              <span className="flex-1">
                <span className="block text-[16px] font-semibold">{s.titulo}</span>
                <span className="block text-[13.5px] text-tinta-suave">{s.texto}</span>
              </span>
              <span className="text-tinta-suave">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => { if (confirm("¿Volver a los datos de ejemplo? Se borra lo que anotaste.")) reiniciar(); }}
        className="toque mt-8 w-full rounded-[16px] border border-dashed border-linea py-3.5 text-[14.5px] text-tinta-suave">
        Volver a los datos de ejemplo
      </button>
    </Pantalla>
  );
}
