"use client";

import { Cargando, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { inicioDelMes, ventas } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { pesos, totalPedido } from "@/lib/tipos";

/** Cómo va el mes: ventas por semana, por producto y los mejores clientes. */
export default function Resumen() {
  const { datos, listo } = useDatos();
  if (!listo) return <Pantalla titulo="Resumen" atras="/mas"><Cargando /></Pantalla>;

  const desde = inicioDelMes();
  const mes = ventas(datos, desde);
  const delMes = datos.pedidos.filter((p) => new Date(p.fecha) >= desde && new Date(p.fecha) <= new Date());

  // últimas 4 semanas, de la más antigua a la actual
  const semanas = [3, 2, 1, 0].map((s) => {
    const fin = new Date();
    fin.setDate(fin.getDate() - s * 7);
    const ini = new Date(fin);
    ini.setDate(ini.getDate() - 6);
    ini.setHours(0, 0, 0, 0);
    return { label: s === 0 ? "Esta" : `Hace ${s}`, monto: ventas(datos, ini, fin).monto };
  });
  const max = Math.max(1, ...semanas.map((s) => s.monto));

  const porProducto = datos.productos.map((pr) => ({
    pr,
    monto: delMes.reduce((s, p) => s + p.lineas.filter((l) => l.productoId === pr.id).reduce((x, l) => x + l.cantidad * l.precio, 0), 0),
  }));
  const top = datos.clientes
    .map((c) => ({ c, monto: delMes.filter((p) => p.clienteId === c.id).reduce((s, p) => s + totalPedido(p), 0) }))
    .filter((x) => x.monto > 0)
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 3);

  return (
    <Pantalla titulo="Resumen" atras="/mas">
      <Tarjeta fondo="bg-palta" className="entrar text-crema">
        <p className="text-[14px] opacity-85">Vendido en {new Date().toLocaleDateString("es-CL", { month: "long" })}</p>
        <p className="cifra font-display text-[36px] font-semibold">{pesos(mes.monto)}</p>
        <p className="text-[14px] opacity-85">{mes.pedidos} pedidos</p>
      </Tarjeta>

      <Titulo>Últimas 4 semanas</Titulo>
      <Tarjeta>
        <div className="flex h-36 items-end gap-3" role="img" aria-label={semanas.map((s) => `${s.label}: ${pesos(s.monto)}`).join(", ")}>
          {semanas.map((s, i) => (
            <div key={s.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="cifra text-[11.5px] text-tinta-suave">{s.monto ? `${pesos(s.monto / 1000)}k` : ""}</span>
              <div className={`w-full rounded-t-[8px] ${i === 3 ? "bg-palta" : "bg-palta-clara"}`} style={{ height: `${(s.monto / max) * 70}%`, minHeight: 4 }} />
              <span className="text-[12px] text-tinta-suave">{s.label}</span>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Titulo>Por producto</Titulo>
      <div className="grid grid-cols-3 gap-2">
        {porProducto.map(({ pr, monto }) => (
          <Tarjeta key={pr.id} className="text-center">
            <p className="text-[24px]" aria-hidden="true">{pr.emoji}</p>
            <p className="cifra font-display text-[16px] font-semibold">{pesos(monto)}</p>
            <p className="text-[12px] text-tinta-suave">{pr.nombre.split(" ")[0]}</p>
          </Tarjeta>
        ))}
      </div>

      <Titulo>Mejores clientes del mes</Titulo>
      <ol className="flex flex-col gap-2">
        {top.map(({ c, monto }, i) => (
          <li key={c.id}>
            <Tarjeta className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yema-clara font-display font-semibold">{i + 1}</span>
              <span className="flex-1 font-medium">{c.nombre}</span>
              <span className="cifra font-semibold">{pesos(monto)}</span>
            </Tarjeta>
          </li>
        ))}
      </ol>
    </Pantalla>
  );
}
