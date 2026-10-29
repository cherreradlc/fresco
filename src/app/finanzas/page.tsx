"use client";

import Link from "next/link";
import { useState } from "react";
import { Cargando, Pantalla, Tarjeta, Titulo } from "@/components/ui";
import { deudaFactura, estadoResultados, vencida } from "@/lib/finanzas";
import { useDatos } from "@/lib/datos";
import { pesos } from "@/lib/tipos";

const SECCIONES = [
  { href: "/finanzas/facturas", titulo: "Facturas", texto: "Por cobrar y por pagar, con vencimientos" },
  { href: "/finanzas/resultados", titulo: "Resultados", texto: "Estado de resultados, balance y más vendidos" },
  { href: "/finanzas/proyeccion", titulo: "Proyección de ventas", texto: "Cómo vienen los próximos meses" },
  { href: "/finanzas/libros", titulo: "Libros para el contador", texto: "Ventas, compras y libro diario en Excel" },
];

/** El lado contable del negocio, en una pantalla. */
export default function Finanzas() {
  const { datos, listo, sincronizarSII } = useDatos();
  const [sync, setSync] = useState<"" | "cargando" | string>("");
  if (!listo) return <Pantalla titulo="Finanzas" atras="/mas"><Cargando /></Pantalla>;

  const porCobrar = datos.facturas.filter((f) => f.tipo === "venta");
  const porPagar = datos.facturas.filter((f) => f.tipo === "compra");
  const suma = (fs: typeof porCobrar) => fs.reduce((s, f) => s + deudaFactura(f), 0);
  const vencidas = datos.facturas.filter(vencida).length;
  const er = estadoResultados(datos);

  async function sincronizar() {
    setSync("cargando");
    const n = await sincronizarSII();
    setSync(n ? `Llegaron ${n} facturas nuevas.` : "Todo al día, no hay facturas nuevas.");
  }

  return (
    <Pantalla titulo="Finanzas" atras="/mas">
      {/* sincronización con el SII (en esta versión, simulada) */}
      <Tarjeta fondo="bg-tinta" className="entrar text-crema">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Facturas del SII</p>
            <p className="text-[13px] opacity-75">
              {datos.ultimaSync
                ? `Última sincronización: ${new Date(datos.ultimaSync).toLocaleString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                : "Aún no se sincroniza hoy"}
            </p>
          </div>
          <button type="button" onClick={sincronizar} disabled={sync === "cargando"}
            className="toque shrink-0 rounded-full bg-yema px-4 py-2.5 text-[14px] font-semibold text-tinta disabled:opacity-70">
            {sync === "cargando" ? "Sincronizando…" : "Sincronizar"}
          </button>
        </div>
        {sync && sync !== "cargando" && <p className="entrar mt-2 text-[14px] text-palta-clara">✓ {sync}</p>}
        <p className="mt-3 border-t border-crema/15 pt-2.5 text-[12px] opacity-60">
          Demostración: las facturas son de ejemplo. La conexión real usa el certificado digital del negocio.
        </p>
      </Tarjeta>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link href="/finanzas/facturas?ver=cobrar" className="toque">
          <Tarjeta>
            <p className="text-[13px] text-tinta-suave">Por cobrar</p>
            <p className="cifra font-display text-[22px] font-semibold text-palta">{pesos(suma(porCobrar))}</p>
            <p className="text-[12.5px] text-tinta-suave">{porCobrar.filter((f) => deudaFactura(f) > 0).length} facturas</p>
          </Tarjeta>
        </Link>
        <Link href="/finanzas/facturas?ver=pagar" className="toque">
          <Tarjeta>
            <p className="text-[13px] text-tinta-suave">Por pagar</p>
            <p className="cifra font-display text-[22px] font-semibold text-deuda">{pesos(suma(porPagar))}</p>
            <p className="text-[12.5px] text-tinta-suave">{porPagar.filter((f) => deudaFactura(f) > 0).length} facturas</p>
          </Tarjeta>
        </Link>
      </div>
      {vencidas > 0 && <p className="mt-2 text-[13.5px] font-medium text-deuda">⚠ {vencidas} {vencidas === 1 ? "factura vencida" : "facturas vencidas"}</p>}

      <Link href="/finanzas/resultados" className="toque mt-3 block">
        <Tarjeta fondo="bg-brote">
          <p className="text-[13px] text-palta">Utilidad del mes</p>
          <p className={`cifra font-display text-[28px] font-semibold ${er.resultado >= 0 ? "text-palta" : "text-deuda"}`}>{pesos(er.resultado)}</p>
          <p className="text-[13px] text-tinta-suave">Margen {Math.round(er.margen * 100)}% sobre ventas netas</p>
        </Tarjeta>
      </Link>

      <Titulo>Reportes</Titulo>
      <ul className="flex flex-col gap-2">
        {SECCIONES.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="toque flex items-center justify-between rounded-[16px] border border-linea bg-white px-4 py-3.5">
              <span>
                <span className="block text-[15.5px] font-semibold">{s.titulo}</span>
                <span className="block text-[13px] text-tinta-suave">{s.texto}</span>
              </span>
              <span className="text-tinta-suave">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </Pantalla>
  );
}
