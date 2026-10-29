import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { DatosProvider } from "@/lib/datos";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fresco · ventas",
  description: "Pedidos, cobros y stock de paltas, huevos y queso de cabra, en el celular.",
  appleWebApp: { capable: true, title: "Fresco", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#3f6b22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bricolage.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DatosProvider>{children}</DatosProvider>
      </body>
    </html>
  );
}
