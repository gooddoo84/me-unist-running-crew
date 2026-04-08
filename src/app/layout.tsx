import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ME UNIST Running Crew",
  description: "ME UNIST 러닝 크루 - 함께 달리고, 함께 성장하자!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <div className="mx-auto max-w-lg min-h-screen flex flex-col">
          <main className="flex-1 px-4 pb-24 pt-4">
            {children}
          </main>
          <NavBar />
        </div>
      </body>
    </html>
  );
}
