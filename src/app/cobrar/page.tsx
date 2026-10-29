"use client";

import { useState } from "react";
import { Cargando, Etiqueta, Icono, Pantalla, Tarjeta } from "@/components/ui";
import { deudores, diasDesde, haceDias, totalDeuda, whatsapp } from "@/lib/calculos";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

/** Todas las deudas, de la más antigua a la más nueva, con cobro por WhatsApp. */
export default function Cobrar() {
  const { datos, listo, pagarCliente } = useDatos();
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [monto, setMonto] = useState("");

  if (!listo) return <Pantalla titulo="Quién me debe"><Cargando /></Pantalla>;
  const lista = deudores(datos);

  return (
    <Pantalla titulo="Quién me debe">
      <Tarjeta fondo="bg-deuda-clara" className="entrar flex items-center justify-between">
        <span className="text-[15px] text-deuda">Total por cobrar</span>
        <span className="cifra font-display text-[28px] font-semibold text-deuda">{pesos(totalDeuda(datos))}</span>
      </Tarjeta>

      {lista.length === 0 && <p className="mt-10 text-center text-tinta-suave">Nadie te debe. ¡Todo al día! 🎉</p>}

      <ul className="mt-4 flex flex-col gap-2.5">
        {lista.map(({ cliente, monto: debe, desde, pedidos }) => {
          const dias = diasDesde(desde);
          const texto = `Hola ${cliente.nombre.split(" ")[0]}, ¿cómo estás? Te escribo para recordarte que quedó pendiente ${pesos(debe)} de ${pedidos === 1 ? "tu último pedido" : `tus últimos ${pedidos} pedidos`}. Puedes transferirme cuando puedas. ¡Gracias! 🥑🥚`;
          const abierto = abriendo === cliente.id;
          return (
            <li key={cliente.id} className="entrar">
              <Tarjeta>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[16.5px] font-semibold">{cliente.nombre}</p>
                    <p className="mt-0.5 text-[13.5px] text-tinta-suave">
                      {pedidos} {pedidos === 1 ? "pedido" : "pedidos"} · {haceDias(dias)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="cifra font-display text-[22px] font-semibold text-deuda">{pesos(debe)}</p>
                    {dias >= 7 && <Etiqueta tono="deuda">Más de una semana</Etiqueta>}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={whatsapp(cliente.telefono, texto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="toque flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#25d366] text-[15px] font-semibold text-white"
                  >
                    <Icono nombre="whatsapp" size={20} /> Cobrar
                  </a>
                  <button
                    type="button"
                    onClick={() => { setAbriendo(abierto ? null : cliente.id); setMonto(String(debe)); }}
                    className="toque h-12 rounded-[14px] bg-brote text-[15px] font-semibold text-palta"
                  >
                    Registrar pago
                  </button>
                </div>

                {abierto && (
                  <form
                    className="entrar mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const n = Number(monto.replace(/\D/g, ""));
                      if (n > 0) pagarCliente(cliente.id, n);
                      setAbriendo(null);
                    }}
                  >
                    <input
                      inputMode="numeric"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      aria-label="Monto pagado"
                      className="cifra min-w-0 flex-1 rounded-[14px] border border-linea px-4 text-[16px] outline-none focus:border-palta"
                    />
                    <button type="submit" className="toque h-12 rounded-[14px] bg-palta px-5 text-[15px] font-semibold text-crema">Guardar</button>
                  </form>
                )}
              </Tarjeta>
            </li>
          );
        })}
      </ul>
    </Pantalla>
  );
}
