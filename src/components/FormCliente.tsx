"use client";

import { useState } from "react";
import { useDatos } from "@/lib/datos";
import { cantidad, type Cliente, type TipoCliente } from "@/lib/tipos";

const CAMPO = "w-full rounded-[14px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta";

/** Agregar (o corregir) un cliente: nombre, WhatsApp, dirección y tipo. */
export default function FormCliente({ inicial, onListo }: { inicial?: Cliente; onListo: (c: Cliente) => void }) {
  const { datos, guardarCliente } = useDatos();
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [telefono, setTelefono] = useState(inicial ? inicial.telefono.replace(/^56/, "") : "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");
  const [tipo, setTipo] = useState<TipoCliente>(inicial?.tipo ?? "detalle");
  const [nota, setNota] = useState(inicial?.nota ?? "");
  const [error, setError] = useState("");

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const digitos = telefono.replace(/\D/g, "").replace(/^56/, "");
    if (!nombre.trim()) return setError("Escribe el nombre del cliente.");
    if (digitos.length !== 9) return setError("El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.");
    const c = guardarCliente({
      id: inicial?.id,
      nombre: nombre.trim(),
      telefono: "56" + digitos,
      direccion: direccion.trim(),
      tipo,
      nota: nota.trim() || undefined,
    });
    onListo(c);
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1.5 text-[14px] font-medium">
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Almacén La Esquina" className={CAMPO} autoFocus />
      </label>
      <label className="flex flex-col gap-1.5 text-[14px] font-medium">
        WhatsApp
        <span className="flex items-center gap-2">
          <span className="rounded-[14px] bg-cascara px-3 py-3.5 text-[16px] text-tinta-suave">+56</span>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" placeholder="9 1234 5678" className={CAMPO} />
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-[14px] font-medium">
        Dirección
        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número y comuna" className={CAMPO} />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-[14px] font-medium">Tipo de cliente</legend>
        <div className="grid grid-cols-2 gap-2">
          {([["detalle", "Al detalle", "Precio normal"], ["mayorista", "Mayorista", "Precio por mayor"]] as const).map(([k, t, s]) => (
            <button key={k} type="button" aria-pressed={tipo === k} onClick={() => setTipo(k)}
              className={`toque rounded-[14px] border-2 px-3 py-3 text-left ${tipo === k ? "border-palta bg-palta text-crema" : "border-linea bg-white"}`}>
              <span className="block text-[15px] font-semibold">{t}</span>
              <span className={`block text-[12.5px] ${tipo === k ? "opacity-85" : "text-tinta-suave"}`}>{s}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* el mínimo para precio por mayor, para que no haya sorpresas */}
      {tipo === "mayorista" && (
        <div className="entrar rounded-[14px] bg-yema-clara px-4 py-3 text-[13.5px] leading-snug text-[#6b4700]">
          <p className="font-semibold">Precio por mayor desde:</p>
          <ul className="mt-1">
            {datos.productos.map((p) => (
              <li key={p.id}>{p.emoji} {cantidad(p.minMayor, p.unidad)} de {p.nombre.toLowerCase()}</li>
            ))}
          </ul>
          <p className="mt-1">Si pide menos, se cobra precio detalle.</p>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-[14px] font-medium">
        Nota <span className="font-normal text-tinta-suave">(opcional)</span>
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: entregar antes de las 9" className={CAMPO} />
      </label>

      {error && <p className="text-[14px] font-medium text-deuda">{error}</p>}
      <button type="submit" className="toque mt-1 h-13 rounded-[16px] bg-palta py-3.5 text-[16px] font-semibold text-crema">
        {inicial ? "Guardar cambios" : "Agregar cliente"}
      </button>
    </form>
  );
}
