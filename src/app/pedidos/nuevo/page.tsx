"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cargando, Etiqueta, Icono, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { useDatos } from "@/lib/datos";
import { pesos, type Cliente } from "@/lib/tipos";

/**
 * Anotar un pedido en segundos: cliente, cantidades con botones grandes y
 * cómo pagó. El precio mayorista o de detalle se pone solo según el cliente.
 */
export default function NuevoPedido() {
  const { datos, listo, guardarPedido } = useDatos();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cant, setCant] = useState<Record<string, number>>({});
  const [pago, setPago] = useState<"pagado" | "fiado" | "parte">("pagado");
  const [abono, setAbono] = useState("");
  const [cuando, setCuando] = useState<"hoy" | "manana">("hoy");
  const [listoPedido, setListoPedido] = useState(false);

  if (!listo) return <Pantalla titulo="Nuevo pedido" atras="/"><Cargando /></Pantalla>;

  const mayor = cliente?.tipo === "mayorista";
  const precio = (id: string) => {
    const p = datos.productos.find((x) => x.id === id)!;
    return mayor ? p.precioMayor : p.precioDetalle;
  };
  const total = Object.entries(cant).reduce((s, [id, n]) => s + n * precio(id), 0);
  const sumar = (id: string, d: number) => setCant((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const hayItems = Object.values(cant).some((n) => n > 0);

  function guardar() {
    if (!cliente || !hayItems) return;
    const fecha = new Date();
    if (cuando === "manana") fecha.setDate(fecha.getDate() + 1);
    const pagado = pago === "pagado" ? total : pago === "fiado" ? 0 : Math.min(total, Number(abono.replace(/\D/g, "")) || 0);
    guardarPedido({
      clienteId: cliente.id,
      fecha: fecha.toISOString(),
      lineas: Object.entries(cant).filter(([, n]) => n > 0).map(([productoId, cantidad]) => ({ productoId, cantidad, precio: precio(productoId) })),
      pagado,
      entregado: false,
    });
    setListoPedido(true);
    setTimeout(() => router.push("/"), 1100);
  }

  if (listoPedido) {
    return (
      <Pantalla titulo="Nuevo pedido">
        <div className="entrar mt-16 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-palta text-crema"><Icono nombre="check" size={40} /></span>
          <p className="mt-5 font-display text-[24px] font-semibold">Pedido guardado</p>
          <p className="mt-1 text-tinta-suave">{cliente?.nombre} · {pesos(total)}</p>
        </div>
      </Pantalla>
    );
  }

  // 1. elegir el cliente
  if (!cliente) {
    const lista = datos.clientes.filter((c) => c.nombre.toLowerCase().includes(busca.toLowerCase()));
    return (
      <Pantalla titulo="¿Para quién?" atras="/">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente"
          className="h-13 w-full rounded-[16px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta"
        />
        <ul className="mt-3 flex flex-col gap-2">
          {lista.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setCliente(c)} className="toque flex w-full items-center justify-between rounded-[16px] border border-linea bg-white px-4 py-3.5 text-left">
                <span>
                  <span className="block text-[16px] font-semibold">{c.nombre}</span>
                  <span className="block text-[13px] text-tinta-suave">{c.direccion}</span>
                </span>
                <Etiqueta tono={c.tipo === "mayorista" ? "yema" : "neutro"}>{c.tipo === "mayorista" ? "Mayorista" : "Detalle"}</Etiqueta>
              </button>
            </li>
          ))}
        </ul>
      </Pantalla>
    );
  }

  // 2. productos y pago
  return (
    <Pantalla titulo="Nuevo pedido" atras="/">
      <button type="button" onClick={() => setCliente(null)} className="toque flex w-full items-center justify-between rounded-[16px] bg-cascara px-4 py-3 text-left">
        <span>
          <span className="block text-[16px] font-semibold">{cliente.nombre}</span>
          <span className="block text-[13px] text-tinta-suave">Precio {mayor ? "mayorista" : "detalle"}</span>
        </span>
        <span className="text-[14px] font-medium text-palta">Cambiar</span>
      </button>

      <Titulo>Productos</Titulo>
      <ul className="flex flex-col gap-2.5">
        {datos.productos.filter((p) => p.disponible).map((p) => {
          const n = cant[p.id] ?? 0;
          return (
            <li key={p.id}>
              <Tarjeta className={`flex items-center gap-3 ${n > 0 ? "border-palta-clara" : ""}`}>
                <span className="text-[30px]" aria-hidden="true">{p.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{p.nombre}</span>
                  <span className="cifra block text-[13.5px] text-tinta-suave">{pesos(precio(p.id))} / {p.unidad} · quedan {p.stock}</span>
                </span>
                <span className="flex items-center gap-2">
                  <button type="button" aria-label={`Quitar ${p.nombre}`} onClick={() => sumar(p.id, -1)} className="toque h-11 w-11 rounded-full bg-cascara text-[22px] leading-none">−</button>
                  <span className="cifra w-7 text-center font-display text-[20px] font-semibold">{n}</span>
                  <button type="button" aria-label={`Agregar ${p.nombre}`} onClick={() => sumar(p.id, 1)} className="toque h-11 w-11 rounded-full bg-palta text-[22px] leading-none text-crema">+</button>
                </span>
              </Tarjeta>
            </li>
          );
        })}
      </ul>

      <Titulo>¿Cuándo se entrega?</Titulo>
      <div className="grid grid-cols-2 gap-2">
        {(["hoy", "manana"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setCuando(k)} className={`toque rounded-[14px] py-3 text-[15px] font-medium ${cuando === k ? "bg-tinta text-crema" : "bg-white border border-linea"}`}>
            {k === "hoy" ? "Hoy" : "Mañana"}
          </button>
        ))}
      </div>

      <Titulo>¿Cómo pagó?</Titulo>
      <div className="grid grid-cols-3 gap-2">
        {([["pagado", "Pagó todo"], ["fiado", "Fiado"], ["parte", "Una parte"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setPago(k)} className={`toque rounded-[14px] py-3 text-[15px] font-medium ${pago === k ? (k === "fiado" ? "bg-deuda text-white" : "bg-palta text-crema") : "bg-white border border-linea"}`}>
            {l}
          </button>
        ))}
      </div>
      {pago === "parte" && (
        <input
          inputMode="numeric"
          value={abono}
          onChange={(e) => setAbono(e.target.value)}
          placeholder="¿Cuánto pagó?"
          className="mt-2 w-full rounded-[14px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta"
        />
      )}

      <div className="h-24" aria-hidden="true" />

      {/* total y guardar, siempre a mano */}
      <div className="fixed inset-x-0 bottom-[72px] z-20 mx-auto max-w-md px-5 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          disabled={!hayItems}
          onClick={guardar}
          className="toque flex w-full items-center justify-between rounded-[20px] bg-yema px-5 py-4 text-tinta shadow-[0_12px_30px_-10px_rgb(34_48_26/0.45)] disabled:opacity-40"
        >
          <span className="font-semibold">Guardar pedido</span>
          <span className="cifra font-display text-[22px] font-semibold">{pesos(total)}</span>
        </button>
      </div>
    </Pantalla>
  );
}
