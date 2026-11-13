import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillScan.AI - Resume Screener",
  description: "Rank candidates against job criteria with explainable scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${hankenGrotesk.variable} font-sans bg-[var(--ground)] text-[var(--ink)] min-h-screen antialiased selection:bg-[var(--line)]`}
      >
        {children}
      </body>
    </html>
  );
}
