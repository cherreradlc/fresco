import { Suspense } from "react";
import Ficha from "./Ficha";

// el id sale de la dirección: Suspense deja que la página cargue al instante
export default function FichaCliente() {
  return (
    <Suspense fallback={<div className="mx-auto mt-24 h-32 max-w-md animate-pulse rounded-[20px] bg-cascara" />}>
      <Ficha />
    </Suspense>
  );
}
