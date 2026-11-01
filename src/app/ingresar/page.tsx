"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { iniciarSesion } from "@/lib/sesion";

/**
 * Welcome and sign-in. For now it's a demo: any email and password work, and
 * nothing is sent anywhere. The real accounts will live in Supabase.
 */
export default function Ingresar() {
  const router = useRouter();
  const [correo, setCorreo] = useState("demo@fresco.cl");
  const [clave, setClave] = useState("palta123");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim())) return setError("Revisa tu correo, parece que le falta algo.");
    if (clave.length < 4) return setError("La contraseña es muy corta.");
    setError("");
    setEntrando(true);
    iniciarSesion(correo.trim());
    window.setTimeout(() => router.replace("/"), 500);
  };

  const campo = "w-full rounded-[16px] border border-linea bg-white px-4 py-3.5 text-[16px] outline-none focus:border-palta focus:ring-2 focus:ring-palta/20";

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md flex-col px-6 pt-[max(env(safe-area-inset-top),48px)] pb-[max(env(safe-area-inset-bottom),28px)]">
      {/* marca */}
      <div className="entrar flex flex-col items-center text-center">
        <span className="flex size-28 items-center justify-center rounded-[32px] bg-brote shadow-[0_18px_40px_-22px_rgb(43_74_22/0.6)]">
          <Logo className="h-20 w-auto" />
        </span>
        <h1 className="mt-5 font-display text-[52px] leading-none font-extrabold tracking-[-0.035em] text-palta">fresco</h1>
        <p className="mt-2 text-[15.5px] text-tinta-suave">Pedidos, cobros y stock en tu celular.</p>
      </div>

      {/* ingreso */}
      <form onSubmit={entrar} noValidate className="entrar mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] font-medium">Correo</span>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={correo} onChange={(e) => setCorreo(e.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] font-medium">Contraseña</span>
          <span className="relative">
            <input type={ver ? "text" : "password"} autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className={`${campo} pr-20`} />
            <button type="button" onClick={() => setVer((v) => !v)} className="toque absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[13.5px] font-medium text-palta">
              {ver ? "Ocultar" : "Ver"}
            </button>
          </span>
        </label>
        <button type="button" className="-mt-1 self-end text-[14px] font-medium text-palta">¿Olvidaste tu contraseña?</button>

        <p className="min-h-5 text-[14px] font-medium text-deuda" aria-live="polite">{error}</p>

        <button type="submit" disabled={entrando} className="toque rounded-full bg-palta py-4 text-[17px] font-semibold text-crema shadow-[0_12px_24px_-14px_rgb(43_74_22/0.8)] disabled:opacity-80">
          {entrando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-auto pt-10 text-center text-[13px] text-tinta-suave">
        Demo: entra con el correo y la clave de ejemplo, o con cualquier otro.
      </p>
    </main>
  );
}
