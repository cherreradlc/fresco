"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { datosDeEjemplo } from "./ejemplo";
import type { Cliente, Datos, Pedido, Producto } from "./tipos";

/**
 * Todo vive en el celular (localStorage): la app funciona sin señal y sin
 * servidor. Más adelante esto se cambia por una base de datos real sin tocar
 * las pantallas, porque todas usan este mismo contexto.
 */

const CLAVE = "fresco:datos:v2";

type Acciones = {
  datos: Datos;
  listo: boolean;
  guardarPedido: (p: Omit<Pedido, "id" | "creado">) => Pedido;
  marcarEntregado: (id: string, entregado: boolean) => void;
  registrarPago: (pedidoId: string, monto: number) => void;
  /** reparte un pago entre las deudas del cliente, de la más antigua a la más nueva */
  pagarCliente: (clienteId: string, monto: number) => void;
  guardarCliente: (c: Omit<Cliente, "id"> & { id?: string }) => Cliente;
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void;
  reiniciar: () => void;
};

const Ctx = createContext<Acciones | null>(null);

const nuevoId = (p: string) => p + Math.random().toString(36).slice(2, 9);

export function DatosProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Datos>({ productos: [], clientes: [], pedidos: [] });
  const [listo, setListo] = useState(false);

  // leer lo guardado (solo existe en el navegador)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(CLAVE);
        setDatos(raw ? (JSON.parse(raw) as Datos) : datosDeEjemplo());
      } catch {
        setDatos(datosDeEjemplo());
      }
      setListo(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
      // sin almacenamiento: sigue funcionando mientras la pestaña esté abierta
    }
  }, [datos, listo]);

  const guardarPedido = useCallback((p: Omit<Pedido, "id" | "creado">) => {
    const nuevo: Pedido = { ...p, id: nuevoId("p"), creado: new Date().toISOString() };
    setDatos((d) => ({
      ...d,
      pedidos: [nuevo, ...d.pedidos],
      // lo vendido sale del stock
      productos: d.productos.map((pr) => {
        const l = p.lineas.find((x) => x.productoId === pr.id);
        return l ? { ...pr, stock: Math.max(0, pr.stock - l.cantidad) } : pr;
      }),
    }));
    return nuevo;
  }, []);

  const marcarEntregado = useCallback((id: string, entregado: boolean) => {
    setDatos((d) => ({ ...d, pedidos: d.pedidos.map((p) => (p.id === id ? { ...p, entregado } : p)) }));
  }, []);

  const registrarPago = useCallback((pedidoId: string, monto: number) => {
    setDatos((d) => ({
      ...d,
      pedidos: d.pedidos.map((p) => {
        if (p.id !== pedidoId) return p;
        const total = p.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
        return { ...p, pagado: Math.min(total, p.pagado + monto) };
      }),
    }));
  }, []);

  const pagarCliente = useCallback((clienteId: string, monto: number) => {
    setDatos((d) => {
      let resta = monto;
      const orden = [...d.pedidos].filter((p) => p.clienteId === clienteId).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const pagos = new Map<string, number>();
      for (const p of orden) {
        if (resta <= 0) break;
        const total = p.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
        const debe = total - p.pagado;
        if (debe <= 0) continue;
        const abono = Math.min(debe, resta);
        pagos.set(p.id, abono);
        resta -= abono;
      }
      return { ...d, pedidos: d.pedidos.map((p) => (pagos.has(p.id) ? { ...p, pagado: p.pagado + pagos.get(p.id)! } : p)) };
    });
  }, []);

  const guardarCliente = useCallback((c: Omit<Cliente, "id"> & { id?: string }) => {
    const cliente: Cliente = { ...c, id: c.id ?? nuevoId("c") };
    setDatos((d) => ({
      ...d,
      clientes: c.id ? d.clientes.map((x) => (x.id === c.id ? cliente : x)) : [...d.clientes, cliente],
    }));
    return cliente;
  }, []);

  const actualizarProducto = useCallback((id: string, cambios: Partial<Producto>) => {
    setDatos((d) => ({ ...d, productos: d.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) }));
  }, []);

  const reiniciar = useCallback(() => setDatos(datosDeEjemplo()), []);

  const valor = useMemo(
    () => ({ datos, listo, guardarPedido, marcarEntregado, registrarPago, pagarCliente, guardarCliente, actualizarProducto, reiniciar }),
    [datos, listo, guardarPedido, marcarEntregado, registrarPago, pagarCliente, guardarCliente, actualizarProducto, reiniciar],
  );
  // las pantallas recién se dibujan con los datos del celular y la hora real:
  // antes de eso (y al armar la página en el servidor) se ve la bienvenida
  return (
    <Ctx.Provider value={valor}>
      {listo ? (
        children
      ) : (
        <div className="flex min-h-[100svh] flex-col items-center justify-center gap-3 bg-palta text-crema">
          <span className="text-[44px]" aria-hidden="true">🥑🥚</span>
          <span className="font-display text-[30px] font-semibold">Fresco</span>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useDatos() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDatos fuera de DatosProvider");
  return c;
}
