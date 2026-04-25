import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ReduxProvider } from "@/components/ReduxProvider";
import AuthGuard from "@/components/auth/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentIQ AI | Human Control. AI Precision.",
  description: "Advanced AI-powered talent screening platform for recruiters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900 min-h-screen flex flex-col`} suppressHydrationWarning>
        <AnimatedBackground />
        <ReduxProvider>
          <AuthGuard>
            <Navbar />
            <main className="flex-1 pt-16 relative z-10">
              {children}
            </main>
          </AuthGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}
