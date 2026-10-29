"use client";

import Link from "next/link";
import { useState } from "react";
import { Cargando, Etiqueta, Pantalla } from "@/components/ui";
import { deudores, diasDesde, haceDias } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { cantidad, pesos } from "@/lib/tipos";

/** Todos los clientes; avisa quién dejó de comprar para llamarlo. */
export default function Clientes() {
  const { datos, listo } = useDatos();
  const [busca, setBusca] = useState("");
  if (!listo) return <Pantalla titulo="Clientes" atras="/mas"><Cargando /></Pantalla>;

  const deuda = new Map(deudores(datos).map((d) => [d.cliente.id, d.monto]));
  const ultima = (id: string) => datos.pedidos.filter((p) => p.clienteId === id).map((p) => p.fecha).sort().at(-1);
  const lista = datos.clientes.filter((c) => c.nombre.toLowerCase().includes(busca.toLowerCase())).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <Pantalla
      titulo="Clientes"
      atras="/mas"
      accion={<Link href="/clientes/nuevo" className="toque rounded-full bg-palta px-4 py-2.5 text-[14.5px] font-semibold text-crema">+ Nuevo</Link>}
    >
      {/* la regla del precio por mayor, siempre a la vista */}
      <div className="mb-3 rounded-[16px] bg-yema-clara px-4 py-3 text-[13.5px] leading-snug text-[#6b4700]">
        <span className="font-semibold">Mayoristas:</span> precio por mayor desde{" "}
        {datos.productos.map((p) => `${cantidad(p.minMayor, p.unidad)} de ${p.nombre.split(" ")[0].toLowerCase()}`).join(", ")}. Si piden menos, se cobra precio detalle.
      </div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente"
        className="w-full rounded-[16px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta" />
      <ul className="mt-3 flex flex-col gap-2">
        {lista.map((c) => {
          const u = ultima(c.id);
          const dias = u ? diasDesde(u) : null;
          return (
            <li key={c.id}>
              <Link href={`/clientes/${c.id}`} className="toque flex items-center justify-between gap-3 rounded-[16px] border border-linea bg-white px-4 py-3.5">
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{c.nombre}</span>
                  <span className="block text-[13px] text-tinta-suave">
                    {c.tipo === "mayorista" ? "Mayorista" : "Detalle"}
                    {dias !== null && ` · última compra ${haceDias(dias)}`}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {deuda.get(c.id) ? <Etiqueta tono="deuda">Debe {pesos(deuda.get(c.id)!)}</Etiqueta> : null}
                  {dias !== null && dias >= 10 && <Etiqueta tono="yema">Llamar</Etiqueta>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Pantalla>
  );
}
