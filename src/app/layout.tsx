import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { GlobalThemeWrapper } from "@/components/providers/global-theme-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qalin Sara - Carpet Inventory Management",
  description: "Modern carpet inventory management system for Qalin Sara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="qalin-sara-theme"
        >
          <LocaleProvider
            defaultLocale="en"
            storageKey="qalin-sara-locale"
          >
            <GlobalThemeWrapper>
              {children}
              <Toaster />
            </GlobalThemeWrapper>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
