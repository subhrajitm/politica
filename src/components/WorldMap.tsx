"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function WorldMap() {
  const mapRef = useRef<HTMLObjectElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const objectEl = mapRef.current;
    if (!objectEl) return;

    const handleLoad = () => {
      try {
        const svgDoc = objectEl.contentDocument as Document | null;
        if (!svgDoc) return;

        const clickable = svgDoc.querySelectorAll<SVGElement>("path[id], g[id]");
        clickable.forEach((el) => {
          el.style.cursor = "pointer";
          el.addEventListener("click", () => {
            const rawId = el.id || "";
            const match = rawId.match(/^[A-Z]{2}$/);
            if (match) {
              const iso2 = match[0].toLowerCase();
              router.push(`/browse/countries/${iso2}`);
            }
          });
        });
      } catch {
        // noop
      }
    };

    objectEl.addEventListener("load", handleLoad);
    return () => objectEl.removeEventListener("load", handleLoad);
  }, [router]);

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <object
        ref={mapRef}
        type="image/svg+xml"
        data="/maps/world.svg"
        className="max-w-full max-h-[70vh] w-full"
        aria-label="World map"
      >
        World map
      </object>
    </div>
  );
}