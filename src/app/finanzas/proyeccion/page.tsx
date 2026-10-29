"use client";

import { Cargando, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { nombreMes, proyeccion } from "@/lib/finanzas";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

/** Ventas de los últimos meses y lo que se espera para los próximos 3. */
export default function Proyeccion() {
  const { datos, listo } = useDatos();
  if (!listo) return <Pantalla titulo="Proyección" atras="/finanzas"><Cargando /></Pantalla>;

  const pr = proyeccion(datos);
  const barras = [...pr.reales.map((r, i) => ({ ...r, tipo: i === pr.reales.length - 1 ? "actual" : "real" })), ...pr.futuros.map((f) => ({ ...f, tipo: "futuro" }))];
  const max = Math.max(1, ...barras.map((b) => b.ventas));
  const proximo = pr.futuros[0];
  const pct = Math.round(pr.crecimiento * 100);

  return (
    <Pantalla titulo="Proyección de ventas" atras="/finanzas">
      <Tarjeta fondo="bg-palta" className="entrar text-crema">
        <p className="text-[14px] opacity-85">Este mes va en</p>
        <p className="cifra font-display text-[32px] font-semibold">{pesos(pr.mesActual)}</p>
        <p className="text-[14px] opacity-85">Si sigue el ritmo, cierra en <span className="font-semibold">{pesos(pr.cierreEstimado)}</span></p>
      </Tarjeta>

      <Titulo>Ventas por mes</Titulo>
      <Tarjeta>
        <div className="flex h-48 items-end gap-2" role="img" aria-label={barras.map((b) => `${nombreMes(b.mes)}: ${pesos(b.ventas)}${b.tipo === "futuro" ? " (proyectado)" : ""}`).join(", ")}>
          {barras.map((b) => (
            <div key={b.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="cifra text-[10.5px] text-tinta-suave">{Math.round(b.ventas / 1000)}k</span>
              <div
                className={`w-full rounded-t-[6px] ${b.tipo === "real" ? "bg-palta-clara" : b.tipo === "actual" ? "bg-palta" : "border-2 border-dashed border-yema bg-yema-clara"}`}
                style={{ height: `${(b.ventas / max) * 75}%` }}
              />
              <span className={`text-[11.5px] ${b.tipo === "futuro" ? "font-medium text-[#8a5c00]" : "text-tinta-suave"}`}>{nombreMes(b.mes)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-tinta-suave">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-palta-clara" /> Real</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-palta" /> Este mes (estimado)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-dashed border-yema bg-yema-clara" /> Proyectado</span>
        </div>
      </Tarjeta>

      <Tarjeta className="mt-3">
        <p className="text-[15px] leading-relaxed">
          Las ventas vienen {pct >= 0 ? "subiendo" : "bajando"} cerca de un <span className="font-semibold">{Math.abs(pct)}% al mes</span>.
          Para {nombreMes(proximo.mes, true)} se esperan unos <span className="font-semibold text-palta">{pesos(proximo.ventas)}</span>.
        </p>
        <p className="mt-2 text-[13px] text-tinta-suave">Sirve para saber cuánta palta y huevo comprar. Calculado con la tendencia de los últimos 6 meses.</p>
      </Tarjeta>
    </Pantalla>
  );
}
