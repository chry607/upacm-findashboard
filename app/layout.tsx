import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideNavigation from "@/components/ui/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/ui/theme-toggle";

import { authClient } from '@/lib/auth/client'; 
import { NeonAuthUIProvider, UserButton } from '@neondatabase/auth/react'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UP-ACM FinDashboard",
  description: "Financial Dashboard Application",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            
        <div className="flex h-full min-h-screen">
          <SideNavigation />
          <main className="relative flex-1 overflow-y-auto p-6">
            <NeonAuthUIProvider
              authClient={authClient}
              redirectTo="/"
              signUp={false}
              localization={{
                SIGN_UP: "",
                SIGN_UP_ACTION: "",
                SIGN_UP_DESCRIPTION: "",
                SIGN_UP_EMAIL: "",
                DONT_HAVE_AN_ACCOUNT: "",
                ALREADY_HAVE_AN_ACCOUNT: "",
              }}
            >
              <header className="absolute right-6 top-10 z-10 flex items-center gap-2">
                <ThemeToggle />
                <UserButton size="icon" className="hover:cursor-pointer"/>
              </header>
              {children}
            </NeonAuthUIProvider>
          </main>
        </div>
        <div id="global-alert-root" />
        </ThemeProvider>
      </body>
    </html>
  );
}
