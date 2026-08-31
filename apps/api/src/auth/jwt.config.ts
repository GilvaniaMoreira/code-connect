import { ConfigService } from '@nestjs/config';

// Central point to enforce that JWT_SECRET is configured. Missing secrets are
// a silent security downgrade — better to fail fast at boot than sign tokens
// with a fallback that leaks between environments.
export function getJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET is not configured. Set it in the environment before starting the API.',
    );
  }
  return secret;
}
