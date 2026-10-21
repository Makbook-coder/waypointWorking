import type { Metadata } from "next";
import { BookmarksView } from "@/components/BookmarksView";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bookmarks</h1>
        <p className="mt-2 text-muted">Everything you saved, newest first.</p>
      </header>
      <BookmarksView />
    </div>
  );
}
