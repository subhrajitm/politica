import type { SVGProps } from 'react';

// Bharatiya Janata Party (BJP) - Lotus
export function BjpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fill="#FF9933"
        d="M12 2c-2.4 2.4-4 4.8-4 8 0 4 4 10 4 10s4-6 4-10c0-3.2-1.6-5.6-4-8z"
      />
      <path
        fill="#138808"
        d="M5.7 12.5a6.5 6.5 0 0012.6 0z"
        transform="translate(0 2)"
      />
      <path
        fill="#FF9933"
        d="M8.2 6.2a6.5 6.5 0 007.6 0z"
        opacity="0.6"
        transform="rotate(-30 12 9.5)"
      />
    </svg>
  );
}
// Indian National Congress (INC) - Hand
export function IncIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        stroke="#4285F4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21V12.5c0-1.93 1.57-3.5 3.5-3.5h.5m4.5 0h.5c1.93 0 3.5 1.57 3.5 3.5V14M16.5 9h-5M8 21H5.5a2.5 2.5 0 01-2.5-2.5v-3a2.5 2.5 0 012.5-2.5H8v8z"
      />
      <path
        stroke="#4285F4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 9a2 2 0 104 0h-4z"
      />
    </svg>
  );
}

// Aam Aadmi Party (AAP) - Broom
export function AapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        stroke="#0072BC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5L7 21m8-16h-4M7 21l-3-3M7 21l3-3m-3 3h12"
      />
      <path
        stroke="#0072BC"
        d="M15 5c-3 0-4-3-4-3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// All India Trinamool Congress (AITC)
export function AitcIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fill="#008000" d="M12 2L2 12l10 10 10-10L12 2z" />
      <path
        fill="#FFFFFF"
        d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
      />
    </svg>
  );
}

// Fallback Icon
export function DefaultPartyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
    </svg>
  );
}
