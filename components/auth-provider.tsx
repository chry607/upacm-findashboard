"use client";

import { NeonAuthUIProvider, UserButton } from "@neondatabase/auth/react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth/client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
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
        <UserButton size="icon" className="hover:cursor-pointer" />
      </header>
      {children}
    </NeonAuthUIProvider>
  );
}
