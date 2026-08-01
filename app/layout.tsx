import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "InsightML • Perceptron Decision Boundary Visualizer",
  description: "Interactive Machine Learning Playground built with Next.js & Pixel Art UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#1e140e] text-[#fefae0] font-vt323 text-xl flex flex-col selection:bg-[#dda15e] selection:text-[#1e140e]">
        {children}
      </body>
    </html>
  );
}
