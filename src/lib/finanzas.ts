import { deudaPedido, totalPedido, type Datos, type Factura } from "./tipos";

/**
 * Cuentas de la parte de finanzas. Los precios de venta incluyen IVA (19 %):
 * el neto es total / 1,19. Todo es referencial: los estados oficiales los
 * firma el contador.
 */

export const IVA = 0.19;
export const neto = (total: number) => Math.round(total / (1 + IVA));

export const deudaFactura = (f: Factura) => Math.max(0, f.total - f.pagado);
export const vencida = (f: Factura) => deudaFactura(f) > 0 && new Date(f.vencimiento) < new Date();

const delMes = (iso: string, ref = new Date()) => {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

/** Estado de resultados del mes en curso. */
export function estadoResultados(d: Datos) {
  const pedidos = d.pedidos.filter((p) => delMes(p.fecha) && new Date(p.fecha) <= new Date());
  const ventasBrutas = pedidos.reduce((s, p) => s + totalPedido(p), 0);
  const ventasNetas = neto(ventasBrutas);
  const costoVentas = pedidos.reduce(
    (s, p) => s + p.lineas.reduce((x, l) => x + l.cantidad * (d.productos.find((pr) => pr.id === l.productoId)?.costo ?? 0), 0),
    0,
  );
  const utilidadBruta = ventasNetas - costoVentas;
  const gastos = d.facturas.filter((f) => f.tipo === "compra" && f.categoria === "gasto" && delMes(f.fecha));
  const gastosOperacion = gastos.reduce((s, f) => s + f.neto, 0);
  const resultado = utilidadBruta - gastosOperacion;
  return {
    ventasNetas,
    costoVentas,
    utilidadBruta,
    gastosOperacion,
    gastosDetalle: gastos,
    resultado,
    margen: ventasNetas ? resultado / ventasNetas : 0,
  };
}

/** Balance simplificado a hoy. */
export function balance(d: Datos) {
  const porCobrarFacturas = d.facturas.filter((f) => f.tipo === "venta").reduce((s, f) => s + deudaFactura(f), 0);
  const fiados = d.pedidos.reduce((s, p) => s + (p.entregado ? deudaPedido(p) : 0), 0);
  const inventario = d.productos.reduce((s, p) => s + p.stock * p.costo, 0);
  const activos = [
    { nombre: "Caja y banco", monto: d.caja },
    { nombre: "Facturas por cobrar", monto: porCobrarFacturas },
    { nombre: "Fiados por cobrar", monto: fiados },
    { nombre: "Inventario (a costo)", monto: inventario },
  ];
  const porPagar = d.facturas.filter((f) => f.tipo === "compra").reduce((s, f) => s + deudaFactura(f), 0);
  const ivaDebito = d.facturas.filter((f) => f.tipo === "venta" && delMes(f.fecha)).reduce((s, f) => s + f.iva, 0);
  const ivaCredito = d.facturas.filter((f) => f.tipo === "compra" && delMes(f.fecha)).reduce((s, f) => s + f.iva, 0);
  const pasivos = [
    { nombre: "Facturas por pagar", monto: porPagar },
    { nombre: "IVA por pagar (mes)", monto: Math.max(0, ivaDebito - ivaCredito) },
  ];
  const totalActivos = activos.reduce((s, a) => s + a.monto, 0);
  const totalPasivos = pasivos.reduce((s, a) => s + a.monto, 0);
  return { activos, pasivos, totalActivos, totalPasivos, patrimonio: totalActivos - totalPasivos };
}

/** Lo más vendido del mes, por monto y por cantidad. */
export function masVendidos(d: Datos) {
  const pedidos = d.pedidos.filter((p) => delMes(p.fecha));
  return d.productos
    .map((pr) => {
      const lineas = pedidos.flatMap((p) => p.lineas.filter((l) => l.productoId === pr.id));
      const cantidad = lineas.reduce((s, l) => s + l.cantidad, 0);
      const monto = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
      const utilidad = neto(monto) - cantidad * pr.costo;
      return { producto: pr, cantidad, monto, utilidad };
    })
    .sort((a, b) => b.monto - a.monto);
}

/** Ventas de los meses anteriores + el actual, y 3 meses proyectados con la tendencia. */
export function proyeccion(d: Datos) {
  const hoy = new Date();
  const mesActual = d.pedidos.filter((p) => delMes(p.fecha) && new Date(p.fecha) <= hoy).reduce((s, p) => s + totalPedido(p), 0);
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const cierreEstimado = Math.round((mesActual / hoy.getDate()) * diasMes);

  const reales = [...d.historico.map((h) => ({ mes: h.mes, ventas: h.ventas })), { mes: claveMes(hoy), ventas: cierreEstimado }];
  // recta de mínimos cuadrados sobre los meses reales
  const n = reales.length;
  const xs = reales.map((_, i) => i);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = reales.reduce((a, r) => a + r.ventas, 0) / n;
  const pendiente = xs.reduce((s, x, i) => s + (x - mx) * (reales[i].ventas - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const base = my - pendiente * mx;
  const futuros = [1, 2, 3].map((k) => {
    const f = new Date(hoy.getFullYear(), hoy.getMonth() + k, 1);
    return { mes: claveMes(f), ventas: Math.max(0, Math.round(base + pendiente * (n - 1 + k))) };
  });
  return { reales, futuros, mesActual, cierreEstimado, crecimiento: my ? pendiente / my : 0 };
}

export const claveMes = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const nombreMes = (clave: string, largo = false) => {
  const [y, m] = clave.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-CL", { month: largo ? "long" : "short" }).replace(".", "");
};

/* ------------------------------------------------------------------ */
/* libros para el contador, en CSV que Excel abre directo               */

const celda = (v: string | number) => {
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (filas: (string | number)[][]) => "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CL");

export function libroVentas(d: Datos, mes: string) {
  const fs = d.facturas.filter((f) => f.tipo === "venta" && claveMes(new Date(f.fecha)) === mes);
  return csv([["Fecha", "Folio", "RUT", "Razón social", "Neto", "IVA", "Total"], ...fs.map((f) => [fecha(f.fecha), f.folio, f.rut, f.razonSocial, f.neto, f.iva, f.total])]);
}

export function libroCompras(d: Datos, mes: string) {
  const fs = d.facturas.filter((f) => f.tipo === "compra" && claveMes(new Date(f.fecha)) === mes);
  return csv([["Fecha", "Folio", "RUT", "Proveedor", "Tipo", "Neto", "IVA", "Total"], ...fs.map((f) => [fecha(f.fecha), f.folio, f.rut, f.razonSocial, f.categoria === "gasto" ? "Gasto" : "Mercadería", f.neto, f.iva, f.total])]);
}

/** Libro diario: un asiento por factura, con debe y haber cuadrados. */
export function libroDiario(d: Datos, mes: string) {
  const filas: (string | number)[][] = [["N°", "Fecha", "Glosa", "Cuenta", "Debe", "Haber"]];
  const fs = d.facturas.filter((f) => claveMes(new Date(f.fecha)) === mes).sort((a, b) => a.fecha.localeCompare(b.fecha));
  fs.forEach((f, i) => {
    const n = i + 1;
    const glosa = `${f.tipo === "venta" ? "Venta" : "Compra"} factura ${f.folio} · ${f.razonSocial}`;
    if (f.tipo === "venta") {
      filas.push([n, fecha(f.fecha), glosa, "Clientes", f.total, ""]);
      filas.push([n, fecha(f.fecha), glosa, "Ventas", "", f.neto]);
      filas.push([n, fecha(f.fecha), glosa, "IVA débito fiscal", "", f.iva]);
    } else {
      filas.push([n, fecha(f.fecha), glosa, f.categoria === "gasto" ? "Gastos de operación" : "Mercaderías", f.neto, ""]);
      filas.push([n, fecha(f.fecha), glosa, "IVA crédito fiscal", f.iva, ""]);
      filas.push([n, fecha(f.fecha), glosa, "Proveedores", "", f.total]);
    }
  });
  return csv(filas);
}

export function descargar(nombre: string, contenido: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
