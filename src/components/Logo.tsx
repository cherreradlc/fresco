import { useId } from "react";

const HUEVO = "M100 16 C54 16 24 88 24 164 C24 218 58 252 100 252 C142 252 176 218 176 164 C176 88 146 16 100 16 Z";
const GRIETA = "100 18 91 62 109 102 100 134 100 206 100 250";
const CORTE = "L100 18 L91 62 L109 102 L100 134 L100 206 L100 250";

/**
 * Fresco's mark: an egg cracked in two. The left half is avocado (flesh and
 * pit), the right half is egg (white and yolk); pit and yolk make one circle.
 */
export default function Logo({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 270" className={className} role="img" aria-label="Fresco">
      <defs>
        <clipPath id={`${id}-izq`}><path d={`M-20 -20 ${CORTE} L-20 290 Z`} /></clipPath>
        <clipPath id={`${id}-der`}><path d={`M220 -20 ${CORTE} L220 290 Z`} /></clipPath>
        <clipPath id={`${id}-huevo`}><path d={HUEVO} /></clipPath>
        <clipPath id={`${id}-ri`}><rect x="-20" y="-20" width="120" height="320" /></clipPath>
        <clipPath id={`${id}-rd`}><rect x="100" y="-20" width="120" height="320" /></clipPath>
      </defs>
      {/* mitad palta */}
      <g clipPath={`url(#${id}-izq)`}>
        <g clipPath={`url(#${id}-huevo)`}>
          <path d={HUEVO} fill="#bfdc6a" />
          <circle cx="100" cy="170" r="36" fill="#8a5530" />
        </g>
      </g>
      {/* mitad huevo */}
      <g clipPath={`url(#${id}-der)`}>
        <path d={HUEVO} fill="#fff" />
        <circle cx="100" cy="170" r="36" fill="#f4b52a" />
      </g>
      {/* contorno y grieta */}
      <path d={HUEVO} fill="none" stroke="#2b4a16" strokeWidth="10" clipPath={`url(#${id}-ri)`} />
      <path d={HUEVO} fill="none" stroke="#3f6b22" strokeWidth="10" clipPath={`url(#${id}-rd)`} />
      <polyline points={GRIETA} fill="none" stroke="#3f6b22" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
