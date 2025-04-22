import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { PrismaClient } from "@/../generated/prisma";
import { resend } from "./resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { admin } from "better-auth/plugins";
const prisma = new PrismaClient();
export const auth = betterAuth({
  baseUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    allowUnverifiedLogin: true,
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
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});
