"use client";

import { useRouter } from "next/navigation";
import FormCliente from "@/components/FormCliente";
import { Pantalla } from "@/components/ui";

export default function NuevoCliente() {
  const router = useRouter();
  return (
    <Pantalla titulo="Nuevo cliente" atras="/clientes">
      <FormCliente onListo={(c) => router.push(`/clientes/${c.id}`)} />
    </Pantalla>
  );
}
