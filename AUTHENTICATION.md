# BetterAuth + Keycloak Integration Guide

This guide explains how to set up BetterAuth with Keycloak OIDC authentication for Next Market.

## Overview

The integration uses:
- **BetterAuth**: Modern authentication library for Next.js
- **Keycloak**: Open-source Identity and Access Management
- **PostgreSQL**: Shared database for both services

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Next.js   │─────▶│  BetterAuth  │─────▶│   Keycloak   │
│  Frontend   │      │  (Auth API)  │      │    (OIDC)    │
└─────────────┘      └──────────────┘      └──────────────┘
                            │                      │
                            └──────────┬───────────┘
                                       ▼
                                 ┌──────────┐
                                 │ Postgres │
                                 └──────────┘
```

## Prerequisites

1. Docker and Docker Compose installed
2. Node.js 18+ installed
3. The project repository cloned

## Setup Instructions

### 1. Start Infrastructure Services

Start PostgreSQL, MinIO, OpenFGA, and Keycloak:

```bash
cd docker
docker compose up -d
```

Wait for all services to be healthy (especially Keycloak takes ~2 minutes to start):

```bash
docker compose ps
```

### 2. Configure Keycloak

1. Open Keycloak Admin Console: http://localhost:8180
2. Login with credentials:
   - Username: `admin`
   - Password: `admin`

3. Create a new Realm:
   - Click on the realm dropdown (top left)
   - Click "Create Realm"
   - Name: `next-market`
   - Click "Create"

4. Create a Client for Next.js:
   - Go to "Clients" in the left menu
   - Click "Create client"
   - Client ID: `next-market-web`
   - Click "Next"
   - Enable "Client authentication"
   - Enable "Standard flow"
   - Click "Save"

5. Configure Client Settings:
   - Go to the "Settings" tab
   - Set Valid redirect URIs:
     ```
     http://localhost:3001/*
     http://localhost:3001/api/auth/callback/keycloak
     ```
   - Set Valid post logout redirect URIs:
     ```
     http://localhost:3001/*
     ```
   - Set Web origins:
     ```
     http://localhost:3001
     ```
   - Click "Save"

6. Get Client Secret:
   - Go to the "Credentials" tab
   - Copy the "Client secret" value

### 3. Configure Environment Variables

1. Copy the example environment file:

```bash
cd ui
cp .env.example .env.local
```

2. Edit `.env.local` and update the following:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=postgresql://nextmarket:nextmarket_dev_password@localhost:5432/nextmarket

# Paste the client secret from Keycloak
KEYCLOAK_CLIENT_ID=next-market-web
KEYCLOAK_CLIENT_SECRET=<your-client-secret-here>
KEYCLOAK_ISSUER=http://localhost:8180/realms/next-market
```

### 4. Initialize BetterAuth Database

BetterAuth needs to create its tables in PostgreSQL:

```bash
cd ui
npm install
npx better-auth migrate
```

This will create the necessary auth tables in your PostgreSQL database.

### 5. Start the Application

Start the backend API:

```bash
# From project root
go run cmd/server/main.go server start
```

Start the frontend (in a new terminal):

```bash
cd ui
npm run dev
```

### 6. Test Authentication

1. Open http://localhost:3001
2. Click "Sign In with Keycloak"
3. You'll be redirected to Keycloak
4. Create a new user or login
5. After successful login, you'll be redirected back to Next Market

## Features

### Implemented

- ✅ Keycloak OIDC integration
- ✅ Session management with BetterAuth
- ✅ Login/Logout UI components
- ✅ Protected routes (ready to implement)
- ✅ User profile display
- ✅ Secure cookie-based sessions

### User Flow

1. User clicks "Sign In with Keycloak"
2. Redirected to Keycloak login page
3. User authenticates with Keycloak
4. Keycloak redirects back with authorization code
5. BetterAuth exchanges code for tokens
6. Session created and stored in PostgreSQL
7. User is logged in with session cookie

## API Endpoints

BetterAuth automatically provides these endpoints:

- `GET  /api/auth/session` - Get current session
- `POST /api/auth/sign-in/social` - Initiate social login
- `GET  /api/auth/callback/keycloak` - OAuth callback
- `POST /api/auth/sign-out` - Sign out user

## Database Schema

BetterAuth creates these tables:

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider links
- `verification` - Email verification tokens

## Security Features

- Secure HTTP-only session cookies
- CSRF protection
- Session expiration (7 days)
- Automatic session refresh
- Secure token storage

## Troubleshooting

### Keycloak connection issues

- Ensure Keycloak is running: `docker compose ps`
- Check Keycloak logs: `docker logs next-market-keycloak`
- Verify the realm and client are configured correctly

### Database connection issues

- Ensure PostgreSQL is running: `docker compose ps`
- Check database credentials in `.env.local`
- Verify the database URL is correct

### Authentication not working

- Clear browser cookies and try again
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure redirect URIs match exactly in Keycloak

### Migration issues

If database migration fails:

```bash
# Check database connectivity
psql postgresql://nextmarket:nextmarket_dev_password@localhost:5432/nextmarket

# Run migration again
npx better-auth migrate
```

## Development

### Adding Protected Routes

Use the `useSession` hook to protect routes:

```tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) return <div>Loading...</div>;
  if (!session) return null;

  return <div>Protected content</div>;
}
```

### Server-Side Session Access

For server components:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ServerProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return <div>Protected content</div>;
}
```

## Next Steps

1. Integrate with OpenFGA for fine-grained authorization
2. Add user roles and permissions in Keycloak
3. Implement plugin access control based on user groups
4. Add user profile management
5. Set up email notifications via Keycloak

## References

- [BetterAuth Documentation](https://www.better-auth.com/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
