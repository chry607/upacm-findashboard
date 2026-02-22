import { createNeonAuth } from '@neondatabase/auth/next/server';

const authSecret = process.env.NEON_AUTH_COOKIE_SECRET;
const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

if (!authSecret) {
  console.warn(
    'Warning: NEON_AUTH_COOKIE_SECRET is not set. ' +
    'Please add it to your environment variables (Vercel Dashboard > Settings > Environment Variables). ' +
    'Using a temporary secret for build time only.'
  );
}

if (!authBaseUrl) {
  console.warn(
    'Warning: NEON_AUTH_BASE_URL is not set. ' +
    'Please add it to your environment variables (Vercel Dashboard > Settings > Environment Variables).'
  );
}

export const auth = createNeonAuth({
  baseUrl: authBaseUrl || 'https://placeholder.neonauth.local',
  cookies: {
    secret: authSecret || 'build-time-secret-placeholder-do-not-use-in-production',
  },
});