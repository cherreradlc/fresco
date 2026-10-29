import { precioPara, type Datos, type Factura, type Linea, type Pedido } from "./tipos";

/**
 * Datos de ejemplo para mostrar la app: clientes y pedidos inventados, con
 * fechas relativas a hoy para que el inicio siempre tenga algo que mostrar.
 */

const dia = (offset: number) => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

export function datosDeEjemplo(): Datos {
  const productos = [
    { id: "palta", nombre: "Palta Hass", unidad: "kg", precioDetalle: 3500, precioMayor: 2800, minMayor: 10, costo: 1500, stock: 46, alerta: 20, disponible: true, emoji: "🥑" },
    { id: "huevo", nombre: "Huevos de campo", unidad: "bandeja", precioDetalle: 6500, precioMayor: 5400, minMayor: 5, costo: 2900, stock: 12, alerta: 15, disponible: true, emoji: "🥚" },
    { id: "queso", nombre: "Queso de cabra", unidad: "unidad", precioDetalle: 7000, precioMayor: 6000, minMayor: 3, costo: 3600, stock: 4, alerta: 3, disponible: true, emoji: "🧀" },
  ];

  const clientes = [
    { id: "c1", nombre: "Almacén Don Tito", tipo: "mayorista" as const, telefono: "56911111111", direccion: "Av. Francisco de Aguirre 1240, La Serena" },
    { id: "c2", nombre: "Restaurant La Pica", tipo: "mayorista" as const, telefono: "56922222222", direccion: "Balmaceda 455, La Serena" },
    { id: "c3", nombre: "Minimarket Sol", tipo: "mayorista" as const, telefono: "56933333333", direccion: "Los Carrera 880, Coquimbo" },
    { id: "c4", nombre: "Carmen Rojas", tipo: "detalle" as const, telefono: "56944444444", direccion: "Pasaje Los Aromos 12" },
    { id: "c5", nombre: "Pedro Muñoz", tipo: "detalle" as const, telefono: "56955555555", direccion: "Calle Larga 230" },
    { id: "c6", nombre: "Café Mirador", tipo: "mayorista" as const, telefono: "56966666666", direccion: "Av. del Mar 3100, La Serena", nota: "Entregar antes de las 9" },
    { id: "c7", nombre: "Lucía Fernández", tipo: "detalle" as const, telefono: "56977777777", direccion: "Los Pinos 45" },
  ];
  const tipo = (cid: string) => clientes.find((c) => c.id === cid)!.tipo;

  let n = 0;
  const pedido = (clienteId: string, offset: number, items: [string, number][], pago: "todo" | "nada" | number, entregado: boolean): Pedido => {
    const lineas: Linea[] = items.map(([productoId, cantidad]) => ({ productoId, cantidad, precio: precioPara(productos.find((x) => x.id === productoId)!, tipo(clienteId), cantidad) }));
    const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
    n++;
    return {
      id: "p" + n,
      clienteId,
      fecha: dia(offset),
      lineas,
      pagado: pago === "todo" ? total : pago === "nada" ? 0 : pago,
      entregado,
      creado: dia(Math.min(offset, 0) - 1),
    };
  };

  const pedidos = [
    // hoy, por entregar
    pedido("c1", 0, [["palta", 10], ["huevo", 4]], "nada", false),
    pedido("c6", 0, [["huevo", 3], ["queso", 2]], "todo", false),
    pedido("c4", 0, [["palta", 2]], "todo", false),
    // mañana
    pedido("c2", 1, [["palta", 8], ["huevo", 2]], "nada", false),
    // historial y fiados
    pedido("c1", -3, [["palta", 12], ["huevo", 5]], 20000, true),
    pedido("c3", -5, [["huevo", 6]], "nada", true),
    pedido("c2", -9, [["palta", 6], ["queso", 1]], "nada", true),
    pedido("c5", -2, [["huevo", 1], ["palta", 1]], "nada", true),
    pedido("c7", -1, [["huevo", 2]], "todo", true),
    pedido("c6", -4, [["huevo", 4], ["palta", 3]], "todo", true),
    pedido("c4", -6, [["queso", 1], ["huevo", 1]], "todo", true),
    pedido("c3", -12, [["palta", 15]], "todo", true),
    pedido("c1", -14, [["palta", 10], ["huevo", 6]], "todo", true),
    pedido("c2", -18, [["huevo", 4]], "todo", true),
    pedido("c6", -20, [["huevo", 5], ["queso", 2]], "todo", true),
  ];

  return { productos, clientes, pedidos, facturas: facturasDeEjemplo(), historico: historicoDeEjemplo(), caja: 1250000 };
}

/* ------------------------------------------------------------------ */
/* facturas: ventas a mayoristas y compras a proveedores               */

let folioVenta = 1240;
let folioCompra = 8800;
export function factura(tipo: "venta" | "compra", razonSocial: string, rut: string, total: number, offset: number, pago: "todo" | "nada", categoria?: "mercaderia" | "gasto", plazo = 30): Factura {
  const neto = Math.round(total / 1.19);
  return {
    id: tipo[0] + (tipo === "venta" ? folioVenta : folioCompra),
    tipo,
    folio: tipo === "venta" ? folioVenta++ : folioCompra++,
    rut,
    razonSocial,
    fecha: dia(offset),
    vencimiento: dia(offset + plazo),
    neto,
    iva: total - neto,
    total,
    pagado: pago === "todo" ? total : 0,
    categoria,
    origen: "sii",
  };
}

function facturasDeEjemplo(): Factura[] {
  folioVenta = 1240;
  folioCompra = 8800;
  return [
    factura("venta", "Comercial Don Tito SpA", "76.412.330-5", 164000, -40, "todo"),
    factura("venta", "Restaurant La Pica Ltda.", "77.118.904-2", 98500, -35, "nada"),
    factura("venta", "Minimarket Sol EIRL", "76.905.221-8", 142000, -20, "todo"),
    factura("venta", "Café Mirador SpA", "77.340.611-K", 61200, -12, "nada"),
    factura("venta", "Comercial Don Tito SpA", "76.412.330-5", 120600, -6, "nada"),
    factura("venta", "Restaurant La Pica Ltda.", "77.118.904-2", 55400, -3, "nada"),
    factura("compra", "Agrícola Valle del Elqui Ltda.", "78.220.145-3", 238000, -25, "todo", "mercaderia"),
    factura("compra", "Granja Los Aromos SpA", "76.881.002-1", 135660, -15, "nada", "mercaderia"),
    factura("compra", "Quesería Cabra Feliz", "77.509.338-6", 49980, -10, "nada", "mercaderia"),
    factura("compra", "Agrícola Valle del Elqui Ltda.", "78.220.145-3", 166600, -4, "nada", "mercaderia"),
    factura("compra", "Combustibles del Norte S.A.", "96.512.400-7", 59500, -8, "todo", "gasto", 0),
    factura("compra", "Envases y Bolsas Coquimbo", "76.330.987-4", 23800, -5, "nada", "gasto"),
    factura("compra", "Entel PCS", "96.806.980-2", 17990, -2, "nada", "gasto", 15),
  ];
}

/** Las que "llegan" al sincronizar con el SII en la demostración. */
export function facturasNuevasSII(): Factura[] {
  return [
    factura("compra", "Granja Los Aromos SpA", "76.881.002-1", 92820, 0, "nada", "mercaderia"),
    factura("venta", "Minimarket Sol EIRL", "76.905.221-8", 76400, 0, "nada"),
  ];
}

function historicoDeEjemplo() {
  const hoy = new Date();
  // los 5 meses anteriores, con verano subiendo: las paltas se venden más
  return [318000, 342000, 365000, 351000, 398000].map((ventas, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + i, 1);
    return { mes: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"), ventas };
  });
}
