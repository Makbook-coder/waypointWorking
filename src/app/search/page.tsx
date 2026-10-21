import type { Metadata } from "next";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Search</h1>
        <p className="mt-2 text-muted">Topics, modules, your notes and resources. Runs entirely in your browser.</p>
      </header>
      <SearchView />
    </div>
  );
}
