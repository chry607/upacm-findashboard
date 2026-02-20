"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const appBaseUrl =
	typeof window !== "undefined"
		? window.location.origin
		: process.env.NEXT_PUBLIC_APP_URL;

if (!appBaseUrl) {
	throw new Error(
		"Missing NEXT_PUBLIC_APP_URL for Neon Auth client base URL."
	);
}

export const authClient = createAuthClient(
	new URL("/api/auth", appBaseUrl).toString(),
	{
		adapter: BetterAuthReactAdapter(),
	}
);