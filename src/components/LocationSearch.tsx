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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Search for a location..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-1 rounded-lg border-2 border-brand-blue-light px-4 py-2 text-brand-blue placeholder:text-brand-blue font-[family-name:var(--font-typewriter)]"
        aria-label="Search location"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg border-2 border-brand-gold bg-brand-gold px-4 py-2 font-bold text-white font-[family-name:var(--font-typewriter)] disabled:opacity-50"
      >
        {disabled ? "Searching…" : "Search"}
      </button>
    </form>
  );
}