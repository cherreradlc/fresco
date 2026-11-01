"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

/**
 * Demo session: there's no real account yet (Supabase comes later). Signing
 * in only leaves a mark in this browser, so the demo opens on the login screen
 * the first time and goes straight to the app after that.
 */
const CLAVE = "fresco-sesion";

export function iniciarSesion(correo: string) {
  try {
    localStorage.setItem(CLAVE, correo);
  } catch {}
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {}
}

type Estado = "pendiente" | "si" | "no";

function leer(): Estado {
  try {
    return localStorage.getItem(CLAVE) ? "si" : "no";
  } catch {
    return "si"; // sin almacenamiento no podemos recordar la sesión: se deja pasar
  }
}

const sinCambios = () => () => {};

/** True once we know there's a session; sends to /ingresar if there isn't. */
export function useSesion() {
  const router = useRouter();
  // en el servidor todavía no sabemos: "pendiente"
  const estado = useSyncExternalStore<Estado>(sinCambios, leer, () => "pendiente");
  useEffect(() => {
    if (estado === "no") router.replace("/ingresar");
  }, [estado, router]);
  return estado === "si";
}
