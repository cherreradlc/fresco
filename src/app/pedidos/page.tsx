"use client";

import Link from "next/link";
import { useState } from "react";
import { Cargando, EstadoPedido, Pantalla, Tarjeta } from "@/components/ui";
import { fechaCorta, mismoDia } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { cantidad, deudaPedido, pesos, totalPedido } from "@/lib/tipos";

const FILTROS = [
  ["porEntregar", "Por entregar"],
  ["fiados", "Fiados"],
  ["todos", "Todos"],
] as const;

/** Los pedidos, para entregar y para revisar. */
export default function Pedidos() {
  const { datos, listo, marcarEntregado } = useDatos();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number][0]>("porEntregar");
  if (!listo) return <Pantalla titulo="Pedidos"><Cargando /></Pantalla>;

  const lista = [...datos.pedidos]
    .filter((p) => (filtro === "porEntregar" ? !p.entregado : filtro === "fiados" ? deudaPedido(p) > 0 : true))
    .sort((a, b) => (filtro === "porEntregar" ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha)));
  const nombre = (id: string) => datos.clientes.find((c) => c.id === id)?.nombre ?? "—";
  const producto = (id: string) => datos.productos.find((p) => p.id === id);

  return (
    <Pantalla titulo="Pedidos">
      <div className="flex gap-2" role="tablist">
        {FILTROS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filtro === k} type="button" onClick={() => setFiltro(k)}
            className={`toque rounded-full px-4 py-2 text-[14px] font-medium ${filtro === k ? "bg-tinta text-crema" : "border border-linea bg-white"}`}>
            {l}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {lista.map((p) => {
          return (
            <li key={p.id} className="entrar">
              <Tarjeta>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/clientes/${p.clienteId}`} className="min-w-0">
                    <p className="truncate text-[16px] font-semibold">{nombre(p.clienteId)}</p>
                    <p className="text-[13px] text-tinta-suave">{mismoDia(p.fecha) ? "Hoy" : fechaCorta(p.fecha)}</p>
                  </Link>
                  <p className="cifra font-display text-[19px] font-semibold">{pesos(totalPedido(p))}</p>
                </div>
                <p className="mt-2 text-[14px] text-tinta-suave">
                  {p.lineas.map((l) => `${producto(l.productoId)?.emoji} ${cantidad(l.cantidad, producto(l.productoId)?.unidad ?? "")}`).join("   ")}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  <EstadoPedido entregado={p.entregado} total={totalPedido(p)} pagado={p.pagado} />
                  {!p.entregado && (
                    <button type="button" onClick={() => marcarEntregado(p.id, true)} className="toque h-11 rounded-[14px] bg-palta text-[14.5px] font-semibold text-crema">
                      Marcar entregado
                    </button>
                  )}
                </div>
              </Tarjeta>
            </li>
          );
        })}
        {lista.length === 0 && <p className="mt-8 text-center text-tinta-suave">No hay pedidos aquí.</p>}
      </ul>
    </Pantalla>
  );
}
