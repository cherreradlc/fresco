/** El negocio: paltas, huevos y a veces queso de cabra, por mayor y al detalle. */

export type Producto = {
  id: string;
  nombre: string;
  /** cómo se vende: "kg", "bandeja", "unidad" */
  unidad: string;
  precioDetalle: number;
  precioMayor: number;
  stock: number;
  /** bajo esta cantidad, la app avisa que queda poco */
  alerta: number;
  /** el queso no siempre hay */
  disponible: boolean;
  emoji: string;
};

export type TipoCliente = "mayorista" | "detalle";

export type Cliente = {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  /** solo números, con código de país: 56912345678 */
  telefono: string;
  direccion: string;
  nota?: string;
};

export type Linea = { productoId: string; cantidad: number; precio: number };

export type Pedido = {
  id: string;
  clienteId: string;
  /** ISO, el día de entrega */
  fecha: string;
  lineas: Linea[];
  /** lo que ya pagó: igual al total si pagó todo, 0 si quedó fiado */
  pagado: number;
  entregado: boolean;
  creado: string;
};

export type Datos = {
  productos: Producto[];
  clientes: Cliente[];
  pedidos: Pedido[];
};

export const totalPedido = (p: Pedido) => p.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
export const deudaPedido = (p: Pedido) => Math.max(0, totalPedido(p) - p.pagado);

/** "1 bandeja", "3 bandejas", "2 unidades"; el kilo no cambia */
export const cantidad = (n: number, unidad: string) =>
  `${n} ${n === 1 || unidad === "kg" ? unidad : unidad === "unidad" ? "unidades" : unidad + "s"}`;

export const pesos = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
