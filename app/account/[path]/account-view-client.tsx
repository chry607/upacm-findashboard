"use client";

import { AccountView } from "@neondatabase/auth/react";

export default function AccountViewClient({ path }: { path: string }) {
  return <AccountView path={path} />;
}
