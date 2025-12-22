import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  
  // Database configuration (using PostgreSQL from docker-compose)
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL || "postgresql://nextmarket:nextmarket_dev_password@localhost:5432/nextmarket",
  },
  
  // Trust the host for reverse proxy setups
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
    "http://localhost:3001",
  ],
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  
  // Email and password authentication 
  emailAndPassword: {
    enabled: true,
  },
  
  // Keycloak OIDC integration is available via the custom provider in keycloak-provider.ts
  // To enable it, configure KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, and KEYCLOAK_ISSUER
  // environment variables and add the keycloak provider to socialProviders configuration
  // See AUTHENTICATION.md for complete setup instructions
});

export type Session = typeof auth.$Infer.Session;
