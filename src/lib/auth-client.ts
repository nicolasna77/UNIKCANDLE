import { createAuthClient } from "better-auth/react";
import { adminClient, oneTapClient } from "better-auth/client/plugins";

// Vérifier que le client_id Google est défini

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    oneTapClient({
      clientId: "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",
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
