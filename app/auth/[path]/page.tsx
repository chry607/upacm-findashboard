import { AuthView } from '@neondatabase/auth/react';
import { redirect } from "next/navigation";

export const dynamicParams = false;

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  if (path === "sign-up") {
    redirect("/auth/sign-in");
  }

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView path={path} redirectTo="/" />
    </main>
  );
}