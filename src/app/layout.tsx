import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KewaFlow — Approval-First AI Marketing Platform",
  description: "AI generates. The Admin approves. KewaFlow publishes. Results guide growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-kewa-bg antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
