import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sendMail } from "./mailer";
import { render } from "@react-email/render";
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
      const html = await render(
        ResetPasswordEmail({ userFirstname: user.name, resetPasswordLink: url })
      );
      await sendMail({
        from: "UnikCandle <noreply@unikcandle.com>",
        to: user.email,
        subject: "Réinitialiser votre mot de passe",
        html,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(
        EmailVerificationEmail({ userFirstname: user.name, verificationLink: url })
      );
      await sendMail({
        from: "UnikCandle <noreply@unikcandle.com>",
        to: user.email,
        subject: "Vérifiez votre adresse email UNIKCANDLE",
        html,
      });
    },
    afterEmailVerified: async (user: { email: string; name: string }) => {
      const html = await render(NewsletterWelcomeEmail());
      await sendMail({
        from: "UnikCandle <noreply@unikcandle.com>",
        to: user.email,
        subject: "Bienvenue chez UNIKCANDLE !",
        html,
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
