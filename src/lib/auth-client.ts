import { createAuthClient } from "better-auth/react";
import { adminClient, oneTapClient } from "better-auth/client/plugins";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID n'est pas défini");
}

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    oneTapClient({
      clientId: googleClientId || "",
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
