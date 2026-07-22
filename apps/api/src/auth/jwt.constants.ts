export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me',
  expiresIn: '1h' as const,
  expiresInSeconds: 3600,
};
