"use client";

import { Cargando, Etiqueta, Pantalla, Tarjeta } from "@/components/ui";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

/** Cuánto queda de cada producto. Cuando llega mercadería se suma aquí. */
export default function Stock() {
  const { datos, listo, actualizarProducto } = useDatos();
  if (!listo) return <Pantalla titulo="Stock" atras="/mas"><Cargando /></Pantalla>;

  return (
    <Pantalla titulo="Stock" atras="/mas">
      <p className="-mt-1 text-[15px] text-tinta-suave">Lo vendido se descuenta solo. Suma aquí lo que llega.</p>
      <ul className="mt-4 flex flex-col gap-3">
        {datos.productos.map((p) => {
          const bajo = p.disponible && p.stock <= p.alerta;
          return (
            <li key={p.id} className="entrar">
              <Tarjeta className={bajo ? "border-yema" : ""}>
                <div className="flex items-center gap-3">
                  <span className="text-[34px]" aria-hidden="true">{p.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-[17px] font-semibold">{p.nombre}</span>
                    <span className="cifra block text-[13px] text-tinta-suave">
                      Detalle {pesos(p.precioDetalle)} · Mayor {pesos(p.precioMayor)} / {p.unidad}
                    </span>
                  </span>
                  {bajo && <Etiqueta tono="yema">Queda poco</Etiqueta>}
                  {!p.disponible && <Etiqueta>No hay</Etiqueta>}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="cifra font-display text-[34px] leading-none font-semibold">
                    {p.stock} <span className="text-[15px] font-normal text-tinta-suave">{p.unidad}</span>
                  </p>
                  <div className="flex gap-2">
                    {[1, 10].map((n) => (
                      <button key={n} type="button" onClick={() => actualizarProducto(p.id, { stock: p.stock + n, disponible: true })}
                        className="toque h-11 rounded-full bg-palta px-4 text-[15px] font-semibold text-crema">+{n}</button>
                    ))}
                    <button type="button" onClick={() => actualizarProducto(p.id, { stock: Math.max(0, p.stock - 1) })}
                      className="toque h-11 w-11 rounded-full bg-cascara text-[20px]" aria-label={`Restar 1 ${p.unidad}`}>−</button>
                  </div>
                </div>

                {p.id === "queso" && (
                  <label className="mt-4 flex items-center justify-between border-t border-linea pt-3 text-[15px]">
                    ¿Hay queso esta semana?
                    <input type="checkbox" checked={p.disponible} onChange={(e) => actualizarProducto(p.id, { disponible: e.target.checked })} className="h-6 w-6 accent-[#3f6b22]" />
                  </label>
                )}
              </Tarjeta>
            </li>
          );
        })}
      </ul>
    </Pantalla>
  );
}
