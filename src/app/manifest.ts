import type { MetadataRoute } from "next";

/** Para instalarla en el celular como una app, con su ícono. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fresco · ventas",
    short_name: "Fresco",
    description: "Pedidos, cobros y stock en el celular.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ee",
    theme_color: "#3f6b22",
    lang: "es-CL",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
