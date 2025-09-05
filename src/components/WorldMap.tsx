"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, RotateCcw, Search, X } from "lucide-react";

interface CountryInfo {
  code: string;
  name: string;
  x: number;
  y: number;
}

export default function WorldMap() {
  const mapRef = useRef<HTMLObjectElement | null>(null);
  const router = useRouter();
  const [hoveredCountry, setHoveredCountry] = useState<CountryInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Country name mapping for search
  const countryNames: Record<string, string> = {
    IN: "India", US: "United States", GB: "United Kingdom", CN: "China",
    JP: "Japan", DE: "Germany", FR: "France", BR: "Brazil", CA: "Canada",
    AU: "Australia", RU: "Russia", IT: "Italy", ES: "Spain", MX: "Mexico",
    KR: "South Korea", NL: "Netherlands", SE: "Sweden", NO: "Norway",
    DK: "Denmark", FI: "Finland", CH: "Switzerland", AT: "Austria",
    BE: "Belgium", IE: "Ireland", PT: "Portugal", GR: "Greece",
    TR: "Turkey", EG: "Egypt", ZA: "South Africa", NG: "Nigeria",
    KE: "Kenya", MA: "Morocco", TN: "Tunisia", DZ: "Algeria",
    LY: "Libya", SD: "Sudan", ET: "Ethiopia", GH: "Ghana",
    CI: "Ivory Coast", SN: "Senegal", ML: "Mali", BF: "Burkina Faso",
    NE: "Niger", TD: "Chad", CM: "Cameroon", CF: "Central African Republic",
    CD: "Democratic Republic of Congo", CG: "Republic of Congo",
    GA: "Gabon", GQ: "Equatorial Guinea", ST: "São Tomé and Príncipe",
    AO: "Angola", ZM: "Zambia", ZW: "Zimbabwe", BW: "Botswana",
    NA: "Namibia", SZ: "Eswatini", LS: "Lesotho", MG: "Madagascar",
    MU: "Mauritius", SC: "Seychelles", KM: "Comoros", DJ: "Djibouti",
    SO: "Somalia", ER: "Eritrea", SS: "South Sudan", UG: "Uganda",
    RW: "Rwanda", BI: "Burundi", TZ: "Tanzania", MZ: "Mozambique",
    MW: "Malawi", ZA: "South Africa", SZ: "Eswatini", LS: "Lesotho",
    BW: "Botswana", NA: "Namibia", ZM: "Zambia", ZW: "Zimbabwe",
    AO: "Angola", CG: "Republic of Congo", CD: "Democratic Republic of Congo",
    CF: "Central African Republic", TD: "Chad", NE: "Niger", ML: "Mali",
    BF: "Burkina Faso", SN: "Senegal", CI: "Ivory Coast", GH: "Ghana",
    TG: "Togo", BJ: "Benin", NG: "Nigeria", CM: "Cameroon", GQ: "Equatorial Guinea",
    GA: "Gabon", ST: "São Tomé and Príncipe", CV: "Cape Verde", GM: "Gambia",
    GN: "Guinea", GW: "Guinea-Bissau", SL: "Sierra Leone", LR: "Liberia",
    MR: "Mauritania", MA: "Morocco", DZ: "Algeria", TN: "Tunisia",
    LY: "Libya", EG: "Egypt", SD: "Sudan", SS: "South Sudan", ET: "Ethiopia",
    ER: "Eritrea", DJ: "Djibouti", SO: "Somalia", KE: "Kenya", UG: "Uganda",
    TZ: "Tanzania", RW: "Rwanda", BI: "Burundi", MW: "Malawi", ZM: "Zambia",
    ZW: "Zimbabwe", BW: "Botswana", NA: "Namibia", ZA: "South Africa",
    SZ: "Eswatini", LS: "Lesotho", MZ: "Mozambique", MG: "Madagascar",
    MU: "Mauritius", SC: "Seychelles", KM: "Comoros", YT: "Mayotte",
    RE: "Réunion", SH: "Saint Helena", AC: "Ascension Island", TA: "Tristan da Cunha",
    // South Asian countries
    NP: "Nepal", BD: "Bangladesh", PK: "Pakistan", LK: "Sri Lanka", 
    BT: "Bhutan", MV: "Maldives", AF: "Afghanistan",
    // Southeast Asian countries
    TH: "Thailand", VN: "Vietnam", ID: "Indonesia", MY: "Malaysia", 
    SG: "Singapore", PH: "Philippines", MM: "Myanmar", KH: "Cambodia",
    LA: "Laos", BN: "Brunei", TL: "East Timor",
    // East Asian countries
    MN: "Mongolia", KP: "North Korea", TW: "Taiwan", HK: "Hong Kong", 
    MO: "Macau",
    // Central Asian countries
    KZ: "Kazakhstan", UZ: "Uzbekistan", KG: "Kyrgyzstan", TJ: "Tajikistan", 
    TM: "Turkmenistan",
    // Middle Eastern countries
    SA: "Saudi Arabia", AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait",
    BH: "Bahrain", OM: "Oman", YE: "Yemen", IQ: "Iraq", SY: "Syria",
    LB: "Lebanon", JO: "Jordan", IL: "Israel", PS: "Palestine", CY: "Cyprus",
    // Other countries
    AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru", VE: "Venezuela",
    UY: "Uruguay", PY: "Paraguay", BO: "Bolivia", EC: "Ecuador", GY: "Guyana",
    SR: "Suriname", GF: "French Guiana", FK: "Falkland Islands"
  };

  useEffect(() => {
    const objectEl = mapRef.current;
    if (!objectEl) return;

    const handleLoad = () => {
      try {
        const svgDoc = objectEl.contentDocument as Document | null;
        if (!svgDoc) return;

        const clickable = svgDoc.querySelectorAll<SVGElement>("g[id]");
        clickable.forEach((el) => {
          const countryCode = el.id;
          if (!countryCode.match(/^[A-Z]{2}$/)) return;

          el.style.cursor = "pointer";
          el.style.transition = "all 0.2s ease";

          // Click handler
          el.addEventListener("click", () => {
            const iso2 = countryCode.toLowerCase();
            router.push(`/browse/countries/${iso2}`);
          });

          // Hover handlers
          el.addEventListener("mouseenter", (e) => {
            const rect = el.getBoundingClientRect();
            const svgRect = svgDoc.documentElement.getBoundingClientRect();
            
            setHoveredCountry({
              code: countryCode,
              name: countryNames[countryCode] || countryCode,
              x: rect.left - svgRect.left + rect.width / 2,
              y: rect.top - svgRect.top - 10
            });

            // Highlight effect
            el.style.fill = "#3b82f6";
            el.style.stroke = "#1e40af";
            el.style.strokeWidth = "2";
            el.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.2))";
          });

          el.addEventListener("mouseleave", () => {
            setHoveredCountry(null);
            
            // Reset highlight unless it's the searched country
            if (highlightedCountry !== countryCode) {
              el.style.fill = "";
              el.style.stroke = "";
              el.style.strokeWidth = "";
              el.style.filter = "";
            }
          });
        });
      } catch {
        // noop
      }
    };

    objectEl.addEventListener("load", handleLoad);
    return () => objectEl.removeEventListener("load", handleLoad);
  }, [router, highlightedCountry]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedCountry(null);
      return;
    }

    const foundCountry = Object.entries(countryNames).find(([code, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundCountry) {
      setHighlightedCountry(foundCountry[0]);
    } else {
      setHighlightedCountry(null);
    }
  }, [searchTerm]);

  // Highlight searched country
  useEffect(() => {
    const objectEl = mapRef.current;
    if (!objectEl) return;

    const svgDoc = objectEl.contentDocument as Document | null;
    if (!svgDoc) return;

    const allCountries = svgDoc.querySelectorAll<SVGElement>("g[id]");
    
    allCountries.forEach((el) => {
      const countryCode = el.id;
      if (highlightedCountry === countryCode) {
        el.style.fill = "#f59e0b";
        el.style.stroke = "#d97706";
        el.style.strokeWidth = "3";
        el.style.filter = "drop-shadow(0 4px 12px rgba(245,158,11,0.4))";
      } else if (!hoveredCountry || hoveredCountry.code !== countryCode) {
        el.style.fill = "";
        el.style.stroke = "";
        el.style.strokeWidth = "";
        el.style.filter = "";
      }
    });
  }, [highlightedCountry, hoveredCountry]);

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoomLevel * 1.2, 3) : Math.max(zoomLevel / 1.2, 0.5);
    setZoomLevel(newZoom);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSearchTerm("");
    setHighlightedCountry(null);
  };

  const handleCountryClick = (countryCode: string) => {
    const iso2 = countryCode.toLowerCase();
    router.push(`/browse/countries/${iso2}`);
  };

  return (
    <div className="relative w-full h-full">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom('in')}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom('out')}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-8 h-8 w-48"
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
        <div
          className="transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
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
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className="absolute z-20 bg-background border rounded-lg shadow-lg px-3 py-2 text-sm font-medium pointer-events-none"
          style={{
            left: hoveredCountry.x,
            top: hoveredCountry.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {hoveredCountry.code}
            </span>
            <span>{hoveredCountry.name}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Click to explore politicians
          </div>
        </div>
      )}

      {/* Search results */}
      {searchTerm && highlightedCountry && (
        <div className="absolute bottom-4 left-4 z-10 bg-background border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
              {highlightedCountry}
            </span>
            <span className="font-medium">{countryNames[highlightedCountry]}</span>
            <Button
              size="sm"
              onClick={() => handleCountryClick(highlightedCountry)}
              className="ml-2"
            >
              View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}