"use client";

import { useState } from "react";
import { Cargando, Pantalla, Tarjeta } from "@/components/ui";
import { claveMes, descargar, libroCompras, libroDiario, libroVentas, nombreMes } from "@/lib/finanzas";
import { useDatos } from "@/lib/datos";

const LIBROS = [
  { id: "ventas", titulo: "Libro de ventas", texto: "Facturas emitidas: folio, RUT, neto, IVA y total", fn: libroVentas },
  { id: "compras", titulo: "Libro de compras", texto: "Facturas recibidas, separando mercadería y gastos", fn: libroCompras },
  { id: "diario", titulo: "Libro diario", texto: "Un asiento por factura, con debe y haber", fn: libroDiario },
] as const;

/** Descarga de los libros del mes, en un archivo que se abre en Excel. */
export default function Libros() {
  const { datos, listo } = useDatos();
  const meses = [0, 1, 2].map((k) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - k);
    return claveMes(d);
  });
  const [mes, setMes] = useState(meses[0]);
  if (!listo) return <Pantalla titulo="Libros" atras="/finanzas"><Cargando /></Pantalla>;

  return (
    <Pantalla titulo="Libros para el contador" atras="/finanzas">
      <p className="-mt-1 text-[15px] text-tinta-suave">Elige el mes y descarga. Se abren directo en Excel.</p>
      <div className="mt-4 flex gap-2">
        {meses.map((m) => (
          <button key={m} type="button" onClick={() => setMes(m)}
            className={`toque flex-1 rounded-full py-2.5 text-[14.5px] font-medium capitalize ${mes === m ? "bg-tinta text-crema" : "border border-linea bg-white"}`}>
            {nombreMes(m, true)}
          </button>
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {LIBROS.map((l) => (
          <li key={l.id}>
            <Tarjeta className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brote text-[13px] font-bold text-palta">XLS</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.titulo}</span>
                <span className="block text-[13px] text-tinta-suave">{l.texto}</span>
              </span>
              <button type="button" onClick={() => descargar(`${l.id}-${mes}.csv`, l.fn(datos, mes))}
                className="toque shrink-0 rounded-full bg-palta px-4 py-2.5 text-[14px] font-semibold text-crema">
                Descargar
              </button>
            </Tarjeta>
          </li>
        ))}
      </ul>
    </Pantalla>
  );
}
