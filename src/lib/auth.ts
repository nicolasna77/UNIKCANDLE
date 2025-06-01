import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { resend } from "./resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { admin } from "better-auth/plugins";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

// Déterminer l'URL de base en fonction de l'environnement
const baseUrl = process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  baseUrl: baseUrl,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://unikcandle.vercel.app"],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "noreply@unikcandle.com",
        to: user.email,
        headers: {
          "X-Mailgun-Variables": JSON.stringify({
            url: url,
          }),
        },
        subject: "Réinitialiser votre mot de passe",
        react: ResetPasswordEmail({
          userFirstname: user.name,
          resetPasswordLink: url,
        }),
      });
    },
  },

  plugins: [
    admin({
      adminRoles: ["ADMIN"],
    }),
    nextCookies(),
  ],
});
export type Session = typeof auth.$Infer.Session;
