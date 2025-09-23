import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { resend } from "./resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { EmailVerificationEmail } from "@/emails/email-verification";
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
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://unikcandle.vercel.app",
    "https://unikcandle.com",
    "https://www.unikcandle.com",
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "noreply@unikcandle.com",
        to: user.email,
        subject: "Vérifiez votre adresse email UNIKCANDLE",
        react: EmailVerificationEmail({
          userFirstname: user.name,
          verificationLink: url,
        }),
      });
    },
    afterEmailVerified: async (user: { email: string; name: string }) => {
      await resend.emails.send({
        from: "noreply@unikcandle.com",
        to: user.email,
        subject: "Bienvenue chez UNIKCANDLE !",
        react: NewsletterWelcomeEmail(),
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
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});
export type Session = typeof auth.$Infer.Session;
