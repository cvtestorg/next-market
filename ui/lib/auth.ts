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
  
  // Note: For Keycloak OIDC integration, use the custom provider in keycloak-provider.ts
  // This will be configured once the Keycloak setup is complete
});

export type Session = typeof auth.$Infer.Session;
