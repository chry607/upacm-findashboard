import { accountViewPaths } from '@neondatabase/auth/react/ui/server';
import { Card, CardContent } from "@/components/ui/card";
import AccountViewClient from "./account-view-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, security, and authentication preferences.
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <AccountViewClient path={path} />
        </CardContent>
        </Card>
      </div>
    </div>
  );
}