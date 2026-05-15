import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  VK_CLIENT_ID: z.string().min(1, 'VK_CLIENT_ID is required'),
  VK_CLIENT_SECRET: z.string().min(1, 'VK_CLIENT_SECRET is required'),
  YANDEX_CLIENT_ID: z.string().min(1, 'YANDEX_CLIENT_ID is required'),
  YANDEX_CLIENT_SECRET: z.string().min(1, 'YANDEX_CLIENT_SECRET is required'),
  PUBLIC_APP_URL: z.string().url('PUBLIC_APP_URL must be a valid URL'),
});

type AuthEnv = z.infer<typeof envSchema>;

let cached: AuthEnv | null = null;

function loadAuthEnv(): AuthEnv {
  if (cached) return cached;
  cached = envSchema.parse({
    JWT_SECRET: process.env.JWT_SECRET,
    VK_CLIENT_ID: process.env.VK_CLIENT_ID,
    VK_CLIENT_SECRET: process.env.VK_CLIENT_SECRET,
    YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
    YANDEX_CLIENT_SECRET: process.env.YANDEX_CLIENT_SECRET,
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
  });
  return cached;
}

// Lazy proxy: validation fires only when a key is actually read at runtime,
// not when the module is first imported (which happens during `astro build`).
export const authEnv = new Proxy({} as AuthEnv, {
  get(_target, key: string) {
    return loadAuthEnv()[key as keyof AuthEnv];
  },
}) as AuthEnv;

export function requireEnv(name: keyof AuthEnv): string {
  return loadAuthEnv()[name];
}
