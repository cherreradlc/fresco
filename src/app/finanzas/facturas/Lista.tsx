"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Cargando, Etiqueta, Pantalla, Tarjeta } from "@/components/ui";
import { fechaCorta } from "@/lib/calculos";
import { deudaFactura, vencida } from "@/lib/finanzas";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

/** Facturas por cobrar (emitidas) y por pagar (recibidas). */
export default function Lista() {
  const { datos, listo, pagarFactura } = useDatos();
  const ver = useSearchParams().get("ver");
  const [tab, setTab] = useState<"cobrar" | "pagar">(ver === "pagar" ? "pagar" : "cobrar");
  const [todas, setTodas] = useState(false);
  if (!listo) return <Pantalla titulo="Facturas" atras="/finanzas"><Cargando /></Pantalla>;

  const tipo = tab === "cobrar" ? "venta" : "compra";
  const lista = datos.facturas
    .filter((f) => f.tipo === tipo && (todas || deudaFactura(f) > 0))
    .sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const total = lista.reduce((s, f) => s + deudaFactura(f), 0);

  return (
    <Pantalla titulo="Facturas" atras="/finanzas">
      <div className="grid grid-cols-2 rounded-full bg-cascara p-1 text-[14.5px] font-medium" role="tablist">
        {([["cobrar", "Por cobrar"], ["pagar", "Por pagar"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} className={`toque rounded-full py-2.5 ${tab === k ? "bg-white shadow-sm" : "text-tinta-suave"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-[14px] text-tinta-suave">{todas ? "Todas" : "Pendientes"}: <span className={`cifra font-semibold ${tab === "cobrar" ? "text-palta" : "text-deuda"}`}>{pesos(total)}</span></p>
        <button type="button" onClick={() => setTodas(!todas)} className="text-[14px] font-medium text-palta">{todas ? "Solo pendientes" : "Ver todas"}</button>
      </div>

      <ul className="mt-3 flex flex-col gap-2.5">
        {lista.map((f) => {
          const debe = deudaFactura(f);
          const venc = vencida(f);
          return (
            <li key={f.id} className="entrar">
              <Tarjeta className={venc ? "border-deuda/40" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-semibold">{f.razonSocial}</p>
                    <p className="text-[12.5px] text-tinta-suave">Factura N° {f.folio} · RUT {f.rut}</p>
                  </div>
                  <p className="cifra font-display text-[19px] font-semibold">{pesos(f.total)}</p>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-tinta-suave">
                  <span>Emitida {fechaCorta(f.fecha)}</span>
                  <span>·</span>
                  {debe <= 0 ? <Etiqueta tono="ok">✓ Pagada</Etiqueta> : venc ? <Etiqueta tono="deuda">Vencida {fechaCorta(f.vencimiento)}</Etiqueta> : <Etiqueta tono="yema">Vence {fechaCorta(f.vencimiento)}</Etiqueta>}
                  {f.categoria === "gasto" && <Etiqueta>Gasto</Etiqueta>}
                  {f.origen === "sii" && <Etiqueta>SII</Etiqueta>}
                </div>
                {debe > 0 && (
                  <button type="button" onClick={() => pagarFactura(f.id)}
                    className={`toque mt-3 h-11 w-full rounded-[14px] text-[14.5px] font-semibold ${tab === "cobrar" ? "bg-palta text-crema" : "bg-tinta text-crema"}`}>
                    {tab === "cobrar" ? "Marcar como cobrada" : "Marcar como pagada"}
                  </button>
                )}
              </Tarjeta>
            </li>
          );
        })}
        {lista.length === 0 && <p className="mt-8 text-center text-tinta-suave">No hay facturas pendientes. 🎉</p>}
      </ul>
    </Pantalla>
  );
}
