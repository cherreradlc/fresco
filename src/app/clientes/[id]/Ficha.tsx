"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import FormCliente from "@/components/FormCliente";
import { Cargando, Etiqueta, Icono, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { fechaCorta, whatsapp } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { deudaPedido, pesos, totalPedido } from "@/lib/tipos";

/** La ficha de un cliente: contacto, lo que debe y todo lo que ha comprado. */
export default function Ficha() {
  const { id } = useParams<{ id: string }>();
  const { datos, listo } = useDatos();
  const [editando, setEditando] = useState(false);
  if (!listo) return <Pantalla titulo="Cliente" atras="/clientes"><Cargando /></Pantalla>;

  const c = datos.clientes.find((x) => x.id === id);
  if (!c) return <Pantalla titulo="Cliente" atras="/clientes"><p className="mt-8 text-tinta-suave">No encontramos este cliente.</p></Pantalla>;

  const pedidos = datos.pedidos.filter((p) => p.clienteId === c.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const debe = pedidos.reduce((s, p) => s + (p.entregado ? deudaPedido(p) : 0), 0);
  const comprado = pedidos.reduce((s, p) => s + totalPedido(p), 0);
  const producto = (pid: string) => datos.productos.find((p) => p.id === pid);

  if (editando)
    return (
      <Pantalla titulo="Editar cliente" atras="/clientes">
        <FormCliente inicial={c} onListo={() => setEditando(false)} />
      </Pantalla>
    );

  return (
    <Pantalla
      titulo={c.nombre}
      atras="/clientes"
      accion={<button type="button" onClick={() => setEditando(true)} className="toque rounded-full border border-linea bg-white px-4 py-2 text-[14px] font-medium">Editar</button>}
    >
      <div className="flex flex-wrap gap-1.5">
        <Etiqueta tono={c.tipo === "mayorista" ? "yema" : "neutro"}>{c.tipo === "mayorista" ? "Precio mayorista" : "Precio detalle"}</Etiqueta>
        {debe > 0 && <Etiqueta tono="deuda">Debe {pesos(debe)}</Etiqueta>}
      </div>
      <p className="mt-3 text-[15px] text-tinta-suave">{c.direccion}</p>
      {c.nota && <p className="mt-1 text-[14px] text-[#8a5c00]">📝 {c.nota}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={whatsapp(c.telefono, `Hola ${c.nombre.split(" ")[0]}! `)} target="_blank" rel="noopener noreferrer"
          className="toque flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#25d366] text-[15px] font-semibold text-white">
          <Icono nombre="whatsapp" size={20} /> WhatsApp
        </a>
        <a href={`tel:+${c.telefono}`} className="toque flex h-12 items-center justify-center gap-2 rounded-[14px] border border-linea bg-white text-[15px] font-semibold">
          <Icono nombre="telefono" size={19} /> Llamar
        </a>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tarjeta><p className="text-[13px] text-tinta-suave">Ha comprado</p><p className="cifra font-display text-[22px] font-semibold">{pesos(comprado)}</p></Tarjeta>
        <Tarjeta><p className="text-[13px] text-tinta-suave">Pedidos</p><p className="cifra font-display text-[22px] font-semibold">{pedidos.length}</p></Tarjeta>
      </div>

      <Titulo accion={<Link href="/pedidos/nuevo" className="text-[14px] font-medium text-palta">+ Pedido</Link>}>Historial</Titulo>
      <ul className="flex flex-col gap-2">
        {pedidos.map((p) => (
          <li key={p.id}>
            <Tarjeta className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-[14.5px] font-medium">{fechaCorta(p.fecha)}</span>
                <span className="block text-[13px] text-tinta-suave">
                  {p.lineas.map((l) => `${producto(l.productoId)?.emoji} ${l.cantidad}`).join("  ")}
                </span>
              </span>
              <span className="text-right">
                <span className="cifra block font-semibold">{pesos(totalPedido(p))}</span>
                {deudaPedido(p) <= 0 ? <Etiqueta tono="ok">✓ Pagado</Etiqueta> : p.pagado > 0 ? <Etiqueta tono="deuda">Pagó {pesos(p.pagado)} · debe {pesos(deudaPedido(p))}</Etiqueta> : <Etiqueta tono="deuda">Fiado · debe {pesos(deudaPedido(p))}</Etiqueta>}
              </span>
            </Tarjeta>
          </li>
        ))}
      </ul>
    </Pantalla>
  );
}
