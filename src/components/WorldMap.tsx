'use client';

import { useRouter } from 'next/navigation';

export default function WorldMap() {
  const router = useRouter();

  const handleCountryClick = () => {
    router.push('/politicians');
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <svg
        viewBox="0 0 1000 500"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full max-h-[70vh]"
      >
        <g fill="#E5E7EB" stroke="#6B7280" strokeWidth="0.5">
          {/* Other countries paths here */}
        </g>
        <g fill="#A5B4FC" stroke="hsl(var(--primary))" strokeWidth="1">
          <path
            className="cursor-pointer transition-all hover:fill-primary/80"
            onClick={handleCountryClick}
            d="M729 223l-2-1 -1-2 -1-1h-1l-1 2 -1 1v2l-2 1 -1 2 -2 1 -1 1 -1 2 -1 1 -1 2 -1 1v1l-1 2v1l-1 1 -1 1v1l-1 1v1l-1 1v1l-1 1v1l-1 1 -1 1v1l-1 1v1l-1 1 -1 1v1l-2 3v2l-1 1 -2 2 -2 1 -1 2v1l1 1h1l1 1 2 1h1l1-1 2-2 2-2 1-2 1-1 1-1 1-2 1-1 1-1 1-1 2-1 3-1 2-1 1-1 1-1 2-1 3-1 2-1 1-1 1-1h1l1-1 1-1 1-1v-1l1-1 2-1 2-1h1l1 1 1 2v1l1 1 1 2 1 1 1 1v1l1 1v1l1 1v1l2 1h1l1-1v-2l1-1 1-1 1-1h1l1-1 1-1 2-1 1-1 1-1 1-1 2-1h1l1 1v1l2 1 1 1v1l1 1v1l1 1 1 1v1l1 1v1l1 1v1l1 1h2l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-1v-1l1-s-1z"
          />
        </g>
      </svg>
    </div>
  );
}
