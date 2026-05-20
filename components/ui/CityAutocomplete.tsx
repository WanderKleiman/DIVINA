"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
  label: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
}

const GEONAMES_USERNAME = process.env.NEXT_PUBLIC_GEONAMES_USERNAME || "";

async function searchGeoNames(q: string): Promise<CityOption[]> {
  if (!GEONAMES_USERNAME) return [];
  const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(q)}&maxRows=5&featureClass=P&username=${GEONAMES_USERNAME}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.geonames) return [];
  return data.geonames.map((g: { name: string; countryName: string; lat: string; lng: string }) => ({
    name: g.name,
    country: g.countryName,
    lat: parseFloat(g.lat),
    lng: parseFloat(g.lng),
    label: `${g.name}, ${g.countryName}`,
  }));
}

async function searchNominatim(q: string): Promise<CityOption[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&featuretype=city`;
  const res = await fetch(url, { headers: { "Accept-Language": "ru,en" } });
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((r: { display_name: string; name: string; lat: string; lon: string; address?: { country?: string } }) => ({
    name: r.name || r.display_name.split(",")[0],
    country: r.address?.country || "",
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    label: `${r.name || r.display_name.split(",")[0]}${r.address?.country ? `, ${r.address.country}` : ""}`,
  }));
}

export default function CityAutocomplete({ value, onChange, placeholder = "Москва", className = "" }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      // Try GeoNames first, fallback to Nominatim
      let results = await searchGeoNames(q);
      if (results.length === 0) {
        results = await searchNominatim(q);
      }
      setOptions(results);
      setOpen(results.length > 0);
    } catch {
      // Fallback to Nominatim on any error
      try {
        const results = await searchNominatim(q);
        setOptions(results);
        setOpen(results.length > 0);
      } catch {
        setOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    onChange(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  }

  function handleSelect(opt: CityOption) {
    setQuery(opt.label);
    onChange(opt.label, opt.lat, opt.lng);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => options.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className || "w-full rounded-xl bg-white/[0.12] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
      {open && options.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {options.map((opt, i) => (
            <button
              key={`${opt.name}-${opt.lat}-${i}`}
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-5 py-3.5 text-base text-white/80 hover:bg-white/10 active:bg-white/15 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
            >
              <span className="text-white">{opt.name}</span>
              {opt.country && <span className="text-white/40 ml-2 text-sm">{opt.country}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
