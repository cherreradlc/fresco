import { precioPara, type Datos, type Linea, type Pedido } from "./tipos";

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
    { id: "palta", nombre: "Palta Hass", unidad: "kg", precioDetalle: 3500, precioMayor: 2800, minMayor: 10, stock: 46, alerta: 20, disponible: true, emoji: "🥑" },
    { id: "huevo", nombre: "Huevos de campo", unidad: "bandeja", precioDetalle: 6500, precioMayor: 5400, minMayor: 5, stock: 12, alerta: 15, disponible: true, emoji: "🥚" },
    { id: "queso", nombre: "Queso de cabra", unidad: "unidad", precioDetalle: 7000, precioMayor: 6000, minMayor: 3, stock: 4, alerta: 3, disponible: true, emoji: "🧀" },
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

  return { productos, clientes, pedidos };
}
