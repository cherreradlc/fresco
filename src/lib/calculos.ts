import { deudaPedido, totalPedido, type Cliente, type Datos } from "./tipos";

/** Cuentas que usan varias pantallas: deudas, ventas del día y del mes. */

export const mismoDia = (iso: string, d = new Date()) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
};

export const diasDesde = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

export type Deudor = { cliente: Cliente; monto: number; desde: string; pedidos: number };

/** Quién debe, de la deuda más antigua a la más nueva. */
export function deudores(d: Datos): Deudor[] {
  const porCliente = new Map<string, Deudor>();
  for (const p of d.pedidos) {
    const debe = deudaPedido(p);
    if (debe <= 0 || !p.entregado) continue;
    const cliente = d.clientes.find((c) => c.id === p.clienteId);
    if (!cliente) continue;
    const prev = porCliente.get(cliente.id);
    if (prev) {
      prev.monto += debe;
      prev.pedidos++;
      if (p.fecha < prev.desde) prev.desde = p.fecha;
    } else porCliente.set(cliente.id, { cliente, monto: debe, desde: p.fecha, pedidos: 1 });
  }
  return [...porCliente.values()].sort((a, b) => a.desde.localeCompare(b.desde));
}

export const totalDeuda = (d: Datos) => deudores(d).reduce((s, x) => s + x.monto, 0);

export function ventas(d: Datos, desde: Date, hasta = new Date()) {
  const ps = d.pedidos.filter((p) => {
    const f = new Date(p.fecha);
    return f >= desde && f <= hasta;
  });
  return { monto: ps.reduce((s, p) => s + totalPedido(p), 0), pedidos: ps.length };
}

export const inicioDelDia = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const finDelDia = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};
export const inicioDelMes = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Link de WhatsApp con un mensaje ya escrito. */
export const whatsapp = (telefono: string, texto: string) =>
  `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;

/** "hoy", "hace 1 día", "hace 5 días" */
export const haceDias = (n: number) => (n === 0 ? "hoy" : `hace ${n} ${n === 1 ? "día" : "días"}`);

export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
