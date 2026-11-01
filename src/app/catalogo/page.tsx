"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { Icono } from "@/components/ui";
import { whatsapp } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

// TODO: el WhatsApp real del negocio
const WHATSAPP_NEGOCIO = "56900000000";

/** Lo que ven sus clientes: productos, precios y pedido armado por WhatsApp. */
export default function Catalogo() {
  const { datos, listo } = useDatos();
  const [cant, setCant] = useState<Record<string, number>>({});
  const [mayor, setMayor] = useState(false);

  const productos = datos.productos.filter((p) => p.disponible);
  const precio = (id: string) => {
    const p = datos.productos.find((x) => x.id === id)!;
    return mayor ? p.precioMayor : p.precioDetalle;
  };
  const total = Object.entries(cant).reduce((s, [id, n]) => s + n * precio(id), 0);
  const texto =
    "Hola! Quiero pedir:\n" +
    Object.entries(cant).filter(([, n]) => n > 0).map(([id, n]) => {
      const p = datos.productos.find((x) => x.id === id)!;
      return `• ${n} ${p.unidad} de ${p.nombre.toLowerCase()}`;
    }).join("\n") +
    `\nTotal aprox: ${pesos(total)}`;

  return (
    <div className="mx-auto min-h-[100svh] max-w-md pb-32">
      <header className="relative overflow-hidden rounded-b-[32px] bg-palta px-6 pt-[max(env(safe-area-inset-top),28px)] pb-8 text-crema">
        <span className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-palta-clara/30" aria-hidden="true" />
        <span className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-yema/30" aria-hidden="true" />
        <span className="relative flex size-16 items-center justify-center rounded-[20px] bg-brote shadow-[0_6px_16px_-8px_rgb(0_0_0/0.4)]">
          <Logo className="h-11 w-auto" />
        </span>
        <h1 className="relative mt-3 font-display text-[40px] leading-none font-extrabold tracking-[-0.035em]">fresco</h1>
        <p className="relative mt-2 text-[15.5px] opacity-90">Paltas, huevos de campo y queso de cabra. Despacho en La Serena y Coquimbo.</p>
      </header>

      <div className="px-5">
        <div className="mt-5 grid grid-cols-2 rounded-full bg-cascara p-1 text-[14.5px] font-medium">
          {[false, true].map((m) => (
            <button key={String(m)} type="button" onClick={() => setMayor(m)} className={`toque rounded-full py-2.5 ${mayor === m ? "bg-white shadow-sm" : "text-tinta-suave"}`}>
              {m ? "Por mayor" : "Al detalle"}
            </button>
          ))}
        </div>

        {!listo ? (
          <div className="mt-6 h-40 animate-pulse rounded-[20px] bg-cascara" />
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {productos.map((p) => {
              const n = cant[p.id] ?? 0;
              return (
                <li key={p.id} className="entrar flex items-center gap-4 rounded-[22px] border border-linea bg-white p-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-brote text-[34px]" aria-hidden="true">{p.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-[17px] font-semibold">{p.nombre}</span>
                    <span className="cifra block font-display text-[18px] text-palta">{pesos(precio(p.id))} <span className="font-sans text-[13px] text-tinta-suave">/ {p.unidad}</span></span>
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <button type="button" aria-label={`Agregar ${p.nombre}`} onClick={() => setCant((c) => ({ ...c, [p.id]: n + 1 }))} className="toque h-10 w-10 rounded-full bg-palta text-[20px] text-crema">+</button>
                    <span className="cifra text-[15px] font-semibold">{n}</span>
                    <button type="button" aria-label={`Quitar ${p.nombre}`} onClick={() => setCant((c) => ({ ...c, [p.id]: Math.max(0, n - 1) }))} className="toque h-10 w-10 rounded-full bg-cascara text-[20px]">−</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-center text-[13px] text-tinta-suave">Los precios por mayor son para almacenes y restaurantes.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),16px)]">
        <a
          href={total > 0 ? whatsapp(WHATSAPP_NEGOCIO, texto) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={total === 0}
          className={`toque flex items-center justify-between rounded-[20px] bg-[#25d366] px-5 py-4 text-white shadow-[0_12px_30px_-10px_rgb(34_48_26/0.45)] ${total === 0 ? "pointer-events-none opacity-50" : ""}`}
        >
          <span className="flex items-center gap-2 font-semibold"><Icono nombre="whatsapp" size={22} /> Pedir por WhatsApp</span>
          <span className="cifra font-display text-[20px] font-semibold">{pesos(total)}</span>
        </a>
      </div>
    </div>
  );
}
