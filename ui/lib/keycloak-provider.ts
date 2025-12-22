import type { OAuthProvider } from "better-auth";

export interface KeycloakProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export const keycloak = (config: {
  clientId: string;
  clientSecret: string;
  issuer: string; // e.g., http://localhost:8180/realms/next-market
}) =>
  ({
    id: "keycloak",
    name: "Keycloak",
    createAuthorizationURL({ state, codeVerifier, redirectURI }) {
      const url = new URL(`${config.issuer}/protocol/openid-connect/auth`);
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("redirect_uri", redirectURI);
      url.searchParams.set("scope", "openid profile email");
      url.searchParams.set("state", state);
      if (codeVerifier) {
        url.searchParams.set("code_challenge", codeVerifier);
        url.searchParams.set("code_challenge_method", "S256");
      }
      return url;
    },
    validateAuthorizationCode: async ({ code, codeVerifier, redirectURI }) => {
      const tokenURL = `${config.issuer}/protocol/openid-connect/token`;
      const body = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectURI,
      });

      if (codeVerifier) {
        body.set("code_verifier", codeVerifier);
      }

      const response = await fetch(tokenURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code: ${response.statusText}`);
      }

      const tokens = await response.json();
      return tokens;
    },
    async getUserInfo(tokens) {
      const userInfoURL = `${config.issuer}/protocol/openid-connect/userinfo`;
      const response = await fetch(userInfoURL, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      const profile: KeycloakProfile = await response.json();
      return {
        user: {
          id: profile.sub,
          email: profile.email || "",
          emailVerified: profile.email_verified || false,
          name: profile.name || profile.preferred_username || "",
          image: profile.picture,
        },
        data: profile,
      };
    },
  }) satisfies OAuthProvider<KeycloakProfile>;
