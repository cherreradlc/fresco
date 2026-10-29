import { Suspense } from "react";
import Lista from "./Lista";

// la pestaña sale de la dirección (?ver=pagar): Suspense deja que cargue al instante
export default function Facturas() {
  return (
    <Suspense fallback={<div className="mx-auto mt-24 h-32 max-w-md animate-pulse rounded-[20px] bg-cascara" />}>
      <Lista />
    </Suspense>
  );
}
