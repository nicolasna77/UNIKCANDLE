import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { resend } from "./resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { admin, oneTap } from "better-auth/plugins";

import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

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
      enabled: false, // Disabled to prevent session data being too large for cookies
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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    oneTap({
      disableSignup: false,
    }),
    admin({
      adminRoles: ["ADMIN"],
    }),
    nextCookies(),
  ],
});
export type Session = typeof auth.$Infer.Session;
