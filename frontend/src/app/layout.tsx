import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillScan.AI - Resume Screening Dashboard",
  description: "AI-Powered Resume Screening & Candidate Ranking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
