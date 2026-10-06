import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NavOk Heal | Modern AI Healthcare Platform",
  description: "Next-generation healthcare consultations, audio-based medical intake, and local facility navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sansFont.variable} ${serifFont.variable}`}>
      <body 
        suppressHydrationWarning
        className="min-h-screen bg-[#FAF7F0] text-[#14332F] antialiased flex flex-col relative font-sans selection:bg-[#2A5A53]/20 selection:text-[#14332F]"
      >
        <AuthProvider>
          {/* Global Auto-Hiding Navbar */}
          <Navbar />

          <main className="flex-1 flex flex-col relative z-10">
            {children}
          </main>

          <Toaster 
            theme="light" 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#14332F",
                border: "1px solid #E8E2D5",
                borderRadius: "16px",
                boxShadow: "0 10px 30px -5px rgba(20, 51, 47, 0.08)",
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
