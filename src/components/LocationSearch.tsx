"use client";

import { useState } from "react";

export default function LocationSearch({
  handleSearch,
}: {
  handleSearch: (location: string) => void;
}) {
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(location);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Search for a location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-1 rounded-lg border-2 border-brand-blue-light px-4 py-2 font-[family-name:var(--font-typewriter)]"
        aria-label="Search location"
      />
      <button
        type="submit"
        className="rounded-lg border-2 border-brand-gold bg-brand-gold px-4 py-2 font-bold text-white font-[family-name:var(--font-typewriter)]"
      >
        Search
      </button>
    </form>
  );
}