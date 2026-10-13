import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Desk - AI Indian Stock & Dividend Research",
  description: "Live search-grounded AI research assistant for Indian (NSE/BSE) stock and dividend investing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
