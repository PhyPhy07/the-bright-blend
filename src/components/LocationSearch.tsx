"use client";

import { useState } from "react";

interface LocationSearchProps {
  onSearch: (location: string) => void;
  disabled?: boolean;
}

export default function LocationSearch({ onSearch, disabled = false }: LocationSearchProps) {
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(location);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-2">
      <input
        type="text"
        placeholder="Search for a location..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="min-h-[44px] flex-1 rounded-lg border-2 border-brand-blue-light px-4 py-3 text-base text-brand-blue placeholder:text-brand-blue font-[family-name:var(--font-typewriter)] sm:py-2"
        aria-label="Search location"
      />
      <button
        type="submit"
        disabled={disabled}
        className="min-h-[44px] shrink-0 rounded-lg border-2 border-brand-gold bg-brand-gold px-5 py-3 font-bold text-white font-[family-name:var(--font-typewriter)] disabled:opacity-50 sm:py-2"
      >
        {disabled ? "Searching…" : "Search"}
      </button>
    </form>
  );
}