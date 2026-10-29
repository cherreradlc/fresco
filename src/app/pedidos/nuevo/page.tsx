"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormCliente from "@/components/FormCliente";
import { Cargando, Etiqueta, Icono, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { useDatos } from "@/lib/datos";
import { cantidad, pesos, precioPara, type Cliente } from "@/lib/tipos";

/**
 * Anotar un pedido en segundos: cliente, cantidades con botones grandes y
 * cómo pagó. El precio por mayor se aplica solo, si el cliente es mayorista y
 * llega a la cantidad mínima de ese producto.
 */
export default function NuevoPedido() {
  const { datos, listo, guardarPedido } = useDatos();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [creando, setCreando] = useState(false);
  const [cant, setCant] = useState<Record<string, number>>({});
  const [pago, setPago] = useState<"pagado" | "fiado" | "parte">("pagado");
  const [abono, setAbono] = useState("");
  const [cuando, setCuando] = useState<"hoy" | "manana">("hoy");
  const [hecho, setHecho] = useState(false);

  if (!listo) return <Pantalla titulo="Nuevo pedido" atras="/"><Cargando /></Pantalla>;

  const producto = (id: string) => datos.productos.find((x) => x.id === id)!;
  const precio = (id: string) => precioPara(producto(id), cliente?.tipo, cant[id] ?? 0);
  const total = Object.entries(cant).reduce((s, [id, n]) => s + n * precio(id), 0);
  const sumar = (id: string, d: number) => setCant((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const hayItems = Object.values(cant).some((n) => n > 0);

  const montoAbono = Number(abono.replace(/\D/g, "")) || 0;
  const pagado = pago === "pagado" ? total : pago === "fiado" ? 0 : Math.min(total, montoAbono);
  const debe = total - pagado;
  // por qué no se puede guardar todavía
  const falta = !hayItems
    ? "Agrega al menos un producto."
    : pago === "parte" && montoAbono <= 0
      ? "Escribe cuánto pagó."
      : pago === "parte" && montoAbono >= total
        ? "Si pagó todo, elige “Pagó todo”."
        : null;

  function guardar() {
    if (!cliente || falta) return;
    const fecha = new Date();
    if (cuando === "manana") fecha.setDate(fecha.getDate() + 1);
    guardarPedido({
      clienteId: cliente.id,
      fecha: fecha.toISOString(),
      lineas: Object.entries(cant).filter(([, n]) => n > 0).map(([productoId, cantidad]) => ({ productoId, cantidad, precio: precio(productoId) })),
      pagado,
      entregado: false,
    });
    setHecho(true);
    setTimeout(() => router.push("/"), 1200);
  }

  if (hecho) {
    return (
      <Pantalla titulo="Nuevo pedido">
        <div className="entrar mt-16 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-palta text-crema"><Icono nombre="check" size={40} /></span>
          <p className="mt-5 font-display text-[24px] font-semibold">Pedido guardado</p>
          <p className="mt-1 text-tinta-suave">{cliente?.nombre} · {pesos(total)}</p>
          {debe > 0 && <p className="mt-1 text-[15px] text-deuda">Queda debiendo {pesos(debe)}</p>}
        </div>
      </Pantalla>
    );
  }

  // 1. elegir (o crear) el cliente
  if (!cliente) {
    if (creando) {
      return (
        <Pantalla titulo="Nuevo cliente" accion={<button type="button" onClick={() => setCreando(false)} className="text-[14.5px] font-medium text-palta">Cancelar</button>}>
          <FormCliente onListo={(c) => { setCliente(c); setCreando(false); }} />
        </Pantalla>
      );
    }
    const lista = datos.clientes.filter((c) => c.nombre.toLowerCase().includes(busca.toLowerCase()));
    return (
      <Pantalla titulo="¿Para quién?" atras="/">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente"
          className="w-full rounded-[16px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta" />
        <button type="button" onClick={() => setCreando(true)}
          className="toque mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-palta-clara bg-brote py-3.5 text-[15.5px] font-semibold text-palta">
          + Nuevo cliente
        </button>
        <ul className="mt-3 flex flex-col gap-2">
          {lista.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setCliente(c)} className="toque flex w-full items-center justify-between gap-3 rounded-[16px] border border-linea bg-white px-4 py-3.5 text-left">
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{c.nombre}</span>
                  <span className="block truncate text-[13px] text-tinta-suave">{c.direccion}</span>
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
  const mayorista = cliente.tipo === "mayorista";
  return (
    <Pantalla titulo="Nuevo pedido" atras="/">
      <button type="button" onClick={() => setCliente(null)} className="toque flex w-full items-center justify-between rounded-[16px] bg-cascara px-4 py-3 text-left">
        <span>
          <span className="block text-[16px] font-semibold">{cliente.nombre}</span>
          <span className="block text-[13px] text-tinta-suave">{mayorista ? "Mayorista" : "Cliente al detalle"}</span>
        </span>
        <span className="text-[14px] font-medium text-palta">Cambiar</span>
      </button>

      <Titulo>Productos</Titulo>
      <ul className="flex flex-col gap-2.5">
        {datos.productos.filter((p) => p.disponible).map((p) => {
          const n = cant[p.id] ?? 0;
          const conMayor = mayorista && n >= p.minMayor;
          const faltan = p.minMayor - n;
          return (
            <li key={p.id}>
              <Tarjeta className={n > 0 ? "border-palta-clara" : ""}>
                <div className="flex items-center gap-3">
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
                </div>
                {/* mayoristas: cuánto falta para el precio por mayor */}
                {mayorista && n > 0 && (
                  <p className={`mt-2 text-[13px] font-medium ${conMayor ? "text-palta" : "text-[#8a5c00]"}`}>
                    {conMayor
                      ? `✓ Precio por mayor (${pesos(p.precioMayor)})`
                      : `Faltan ${cantidad(faltan, p.unidad)} para precio por mayor (${pesos(p.precioMayor)})`}
                  </p>
                )}
              </Tarjeta>
            </li>
          );
        })}
      </ul>

      <Titulo>¿Cuándo se entrega?</Titulo>
      <div className="grid grid-cols-2 gap-2">
        {(["hoy", "manana"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setCuando(k)} className={`toque rounded-[14px] py-3 text-[15px] font-medium ${cuando === k ? "bg-tinta text-crema" : "border border-linea bg-white"}`}>
            {k === "hoy" ? "Hoy" : "Mañana"}
          </button>
        ))}
      </div>

      <Titulo>¿Cómo pagó?</Titulo>
      <div className="grid grid-cols-3 gap-2">
        {([["pagado", "Pagó todo"], ["fiado", "Fiado"], ["parte", "Una parte"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setPago(k)} className={`toque rounded-[14px] py-3 text-[15px] font-medium ${pago === k ? (k === "fiado" ? "bg-deuda text-white" : "bg-palta text-crema") : "border border-linea bg-white"}`}>
            {l}
          </button>
        ))}
      </div>
      {pago === "parte" && (
        <label className="entrar mt-3 flex flex-col gap-1.5 text-[14px] font-medium">
          ¿Cuánto pagó?
          <span className="flex items-center gap-2 rounded-[14px] border border-linea bg-white px-4 focus-within:border-palta">
            <span className="text-[16px] text-tinta-suave">$</span>
            <input inputMode="numeric" value={abono} onChange={(e) => setAbono(e.target.value.replace(/\D/g, "") ? Number(e.target.value.replace(/\D/g, "")).toLocaleString("es-CL") : "")}
              placeholder="0" className="cifra w-full bg-transparent py-3.5 text-[18px] outline-none" />
          </span>
        </label>
      )}

      {/* el resumen: total, lo que pagó y lo que queda */}
      <Tarjeta className="mt-5">
        <dl className="cifra flex flex-col gap-1.5 text-[15px]">
          <div className="flex justify-between"><dt className="text-tinta-suave">Total</dt><dd className="font-display text-[20px] font-semibold">{pesos(total)}</dd></div>
          <div className="flex justify-between"><dt className="text-tinta-suave">Pagó</dt><dd className="font-semibold text-palta">{pesos(pagado)}</dd></div>
          <div className="flex justify-between border-t border-linea pt-1.5"><dt className="text-tinta-suave">Queda debiendo</dt><dd className={`font-semibold ${debe > 0 ? "text-deuda" : ""}`}>{pesos(debe)}</dd></div>
        </dl>
      </Tarjeta>

      {falta && hayItems && <p className="mt-3 text-center text-[14px] font-medium text-deuda">{falta}</p>}
      <button type="button" disabled={!!falta} onClick={guardar}
        className="toque mt-3 w-full rounded-[20px] bg-yema py-4 text-[17px] font-semibold text-tinta disabled:opacity-40">
        Guardar pedido
      </button>
    </Pantalla>
  );
}
