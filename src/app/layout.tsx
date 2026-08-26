import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { TerminalSandbox } from "@/components/layout/TerminalSandbox";
import { ConsoleEasterEgg } from "@/components/layout/ConsoleEasterEgg";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhananjay Singh | Software Engineer & Student",
  description: "Personal portfolio and developer platform of Dhananjay Singh, showcasing systems development, projects, and academic coursework.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Grid Pattern Overlay */}
          <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)/20_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)/20_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35" />
          </div>

          <Navbar />
          <main className="grow flex flex-col">
            {children}
          </main>
          <Footer />
          <CommandMenu />
          <TerminalSandbox />
          <ConsoleEasterEgg />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
