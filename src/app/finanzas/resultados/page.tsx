"use client";

import { Cargando, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { balance, estadoResultados, masVendidos } from "@/lib/finanzas";
import { useDatos } from "@/lib/datos";
import { cantidad, pesos } from "@/lib/tipos";

function Fila({ nombre, monto, fuerte, menos, tono }: { nombre: string; monto: number; fuerte?: boolean; menos?: boolean; tono?: string }) {
  return (
    <div className={`flex justify-between py-1.5 ${fuerte ? "border-t border-linea pt-2.5 font-semibold" : ""}`}>
      <dt className={fuerte ? "" : "text-tinta-suave"}>{nombre}</dt>
      <dd className={`cifra ${tono ?? ""}`}>{menos ? "−" : ""}{pesos(Math.abs(monto))}</dd>
    </div>
  );
}

/** Estado de resultados del mes, balance simplificado y lo más vendido. */
export default function Resultados() {
  const { datos, listo } = useDatos();
  if (!listo) return <Pantalla titulo="Resultados" atras="/finanzas"><Cargando /></Pantalla>;

  const er = estadoResultados(datos);
  const b = balance(datos);
  const top = masVendidos(datos);
  const maxMonto = Math.max(1, ...top.map((t) => t.monto));
  const mes = new Date().toLocaleDateString("es-CL", { month: "long" });

  return (
    <Pantalla titulo="Resultados" atras="/finanzas">
      <Titulo>Estado de resultados · {mes}</Titulo>
      <Tarjeta>
        <dl className="text-[15px]">
          <Fila nombre="Ventas netas (sin IVA)" monto={er.ventasNetas} />
          <Fila nombre="Costo de lo vendido" monto={er.costoVentas} menos />
          <Fila nombre="Utilidad bruta" monto={er.utilidadBruta} fuerte />
          <Fila nombre="Gastos (bencina, bolsas, teléfono)" monto={er.gastosOperacion} menos />
          <Fila nombre="Resultado del mes" monto={er.resultado} fuerte tono={er.resultado >= 0 ? "text-palta" : "text-deuda"} />
        </dl>
        <p className="mt-2 text-[13px] text-tinta-suave">
          Margen: <span className="font-semibold text-tinta">{Math.round(er.margen * 100)}%</span> de cada venta queda como ganancia.
        </p>
      </Tarjeta>

      <Titulo>Productos más vendidos · {mes}</Titulo>
      <ul className="flex flex-col gap-2">
        {top.map((t, i) => (
          <li key={t.producto.id}>
            <Tarjeta>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yema-clara font-display text-[15px] font-semibold">{i + 1}</span>
                <span className="text-[24px]" aria-hidden="true">{t.producto.emoji}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{t.producto.nombre}</span>
                  <span className="block text-[12.5px] text-tinta-suave">{cantidad(t.cantidad, t.producto.unidad)} · ganancia {pesos(t.utilidad)}</span>
                </span>
                <span className="cifra font-semibold">{pesos(t.monto)}</span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-cascara">
                <div className="h-full rounded-full bg-palta" style={{ width: `${(t.monto / maxMonto) * 100}%` }} />
              </div>
            </Tarjeta>
          </li>
        ))}
      </ul>

      <Titulo>Balance a hoy</Titulo>
      <Tarjeta>
        <p className="text-[13px] font-semibold tracking-wide text-tinta-suave uppercase">Lo que tienes</p>
        <dl className="text-[15px]">
          {b.activos.map((a) => <Fila key={a.nombre} nombre={a.nombre} monto={a.monto} />)}
          <Fila nombre="Total activos" monto={b.totalActivos} fuerte />
        </dl>
        <p className="mt-4 text-[13px] font-semibold tracking-wide text-tinta-suave uppercase">Lo que debes</p>
        <dl className="text-[15px]">
          {b.pasivos.map((a) => <Fila key={a.nombre} nombre={a.nombre} monto={a.monto} />)}
          <Fila nombre="Total pasivos" monto={b.totalPasivos} fuerte />
        </dl>
        <dl className="mt-3 rounded-[14px] bg-brote px-3 text-[15.5px]">
          <Fila nombre="Patrimonio (lo que es tuyo)" monto={b.patrimonio} fuerte tono="text-palta" />
        </dl>
      </Tarjeta>
      <p className="mt-3 text-[12.5px] text-tinta-suave">Referencial, para tomar decisiones. Los estados oficiales los prepara el contador.</p>
    </Pantalla>
  );
}
