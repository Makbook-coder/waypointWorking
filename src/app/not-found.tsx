import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-bold">Off the map</h1>
      <p className="mt-2 text-muted">That page isn&apos;t on any line.</p>
      <Link href="/roadmap" className="mt-6 inline-block underline underline-offset-2">
        Back to the roadmap
      </Link>
    </div>
  );
}
