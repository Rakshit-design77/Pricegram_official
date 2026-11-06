export function validateEnvironment(): void {
  // Audit secret handling on startup/module load
  const requiredKeys = [
    'VALUESERP_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    const errorMsg = `[CRITICAL] Missing required environment variables on startup: ${missingKeys.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
