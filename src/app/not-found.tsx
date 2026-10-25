import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-6xl font-bold text-teal-400">404</h1>
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested page could not be found or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
