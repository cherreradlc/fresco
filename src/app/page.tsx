"use client";

import Link from "next/link";
import { Cargando, Etiqueta, Icono, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { deudores, finDelDia, inicioDelDia, inicioDelMes, mismoDia, totalDeuda, ventas } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { cantidad, deudaPedido, pesos, totalPedido } from "@/lib/tipos";

/** Lo primero al abrirla: cuánto te deben, cuánto vendiste y qué entregar hoy. */
export default function Inicio() {
  const { datos, listo, marcarEntregado } = useDatos();
  const saludo = new Date().getHours() < 12 ? "Buenos días" : new Date().getHours() < 20 ? "Buenas tardes" : "Buenas noches";

  if (!listo) return <Pantalla titulo={saludo}><Cargando /></Pantalla>;

  const deuda = totalDeuda(datos);
  const hoy = ventas(datos, inicioDelDia(), finDelDia());
  const mes = ventas(datos, inicioDelMes(), finDelDia());
  const entregas = datos.pedidos.filter((p) => mismoDia(p.fecha) && !p.entregado);
  const cliente = (id: string) => datos.clientes.find((c) => c.id === id);
  const bajos = datos.productos.filter((p) => p.disponible && p.stock <= p.alerta);

  return (
    <Pantalla titulo={saludo}>
      <p className="-mt-1 text-[15px] text-tinta-suave">
        {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* lo que te deben, lo más importante */}
      <Link href="/cobrar" className="toque entrar mt-5 block rounded-[24px] bg-palta p-5 text-crema">
        <p className="text-[14px] opacity-85">Te deben</p>
        <p className="cifra mt-1 font-display text-[40px] leading-none font-semibold">{pesos(deuda)}</p>
        <p className="mt-3 flex items-center justify-between text-[14px]">
          <span className="opacity-85">{deudores(datos).length} clientes con deuda</span>
          <span className="flex items-center gap-1.5 rounded-full bg-crema/15 px-3 py-1 font-medium">Cobrar →</span>
        </p>
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Tarjeta className="entrar">
          <p className="text-[13px] text-tinta-suave">Vendido hoy</p>
          <p className="cifra mt-1 font-display text-[24px] font-semibold">{pesos(hoy.monto)}</p>
          <p className="text-[13px] text-tinta-suave">{hoy.pedidos} pedidos</p>
        </Tarjeta>
        <Tarjeta className="entrar">
          <p className="text-[13px] text-tinta-suave">Este mes</p>
          <p className="cifra mt-1 font-display text-[24px] font-semibold">{pesos(mes.monto)}</p>
          <p className="text-[13px] text-tinta-suave">{mes.pedidos} pedidos</p>
        </Tarjeta>
      </div>

      <Titulo accion={<Link href="/pedidos" className="text-[14px] font-medium text-palta">Ver todos</Link>}>
        Por entregar hoy
      </Titulo>
      {entregas.length === 0 ? (
        <Tarjeta><p className="text-center text-[15px] text-tinta-suave">No quedan entregas para hoy 🎉</p></Tarjeta>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {entregas.map((p) => {
            const c = cliente(p.clienteId);
            const debe = deudaPedido(p);
            return (
              <li key={p.id}>
                <Tarjeta className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold">{c?.nombre}</p>
                    <p className="truncate text-[13.5px] text-tinta-suave">
                      {p.lineas.map((l) => cantidad(l.cantidad, datos.productos.find((x) => x.id === l.productoId)?.unidad ?? "")).join(" · ")} · {pesos(totalPedido(p))}
                    </p>
                    <div className="mt-1.5">{debe <= 0 ? <Etiqueta tono="ok">✓ Pagado</Etiqueta> : p.pagado > 0 ? <Etiqueta tono="deuda">Pagó {pesos(p.pagado)} · debe {pesos(debe)}</Etiqueta> : <Etiqueta tono="deuda">Fiado · debe {pesos(debe)}</Etiqueta>}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => marcarEntregado(p.id, true)}
                    className="toque flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-palta px-3.5 text-[13.5px] font-semibold text-crema"
                  >
                    <Icono nombre="check" size={20} /> Marcar entregado
                  </button>
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      )}

      <Titulo accion={<Link href="/stock" className="text-[14px] font-medium text-palta">Stock</Link>}>Lo que queda</Titulo>
      <div className="grid grid-cols-3 gap-2.5">
        {datos.productos.map((p) => {
          const bajo = p.disponible && p.stock <= p.alerta;
          return (
            <Link key={p.id} href="/stock" className={`toque rounded-[18px] border p-3 text-center ${bajo ? "border-yema bg-yema-clara" : "border-linea bg-white"} ${p.disponible ? "" : "opacity-50"}`}>
              <p className="text-[26px]" aria-hidden="true">{p.emoji}</p>
              <p className="cifra font-display text-[20px] font-semibold">{p.disponible ? p.stock : "—"}</p>
              <p className="text-[12px] text-tinta-suave">{p.disponible ? cantidad(p.stock, p.unidad).replace(/^d+ /, "") : "sin stock"}</p>
            </Link>
          );
        })}
      </div>
      {bajos.length > 0 && (
        <p className="mt-2.5 text-[13.5px] text-[#8a5c00]">Queda poco: {bajos.map((b) => b.nombre.toLowerCase()).join(" y ")}.</p>
      )}
    </Pantalla>
  );
}
