import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const ResetPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe UNIKCANDLE</Preview>
      <Body className="bg-gray-50 py-4">
        <Container className="bg-white border border-gray-200 rounded-lg p-8 max-w-[600px] mx-auto">
          <div className="flex justify-center mb-8">
            <Img
              src={`${baseUrl}/logo/logo-primary-color.png`}
              width="60"
              height="60"
              alt="UNIKCANDLE"
              className="rounded-xl"
            />
          </div>

          <Section>
            <Text className="text-gray-800 text-lg mb-4">
              Bonjour {userFirstname},
            </Text>

            <Text className="text-gray-600 mb-4">
              Vous avez demandé la réinitialisation de votre mot de passe pour
              votre compte UNIKCANDLE. Si c&apos;est bien vous, vous pouvez
              définir un nouveau mot de passe en cliquant sur le bouton
              ci-dessous :
            </Text>

            <Button
              href={resetPasswordLink}
              className="bg-primary text-white rounded-lg px-6 py-3 text-center block w-full max-w-[200px] mx-auto mb-6"
            >
              Réinitialiser le mot de passe
            </Button>

            <Text className="text-gray-600 mb-4">
              Si vous n&apos;avez pas demandé cette réinitialisation, vous
              pouvez ignorer cet email.
            </Text>

            <Text className="text-gray-600 mb-4">
              Pour la sécurité de votre compte, ne partagez pas cet email.
              Consultez notre{" "}
              <Link href={`${baseUrl}/aide`} className="text-primary underline">
                centre d&apos;aide
              </Link>{" "}
              pour plus de conseils de sécurité.
            </Text>

            <Text className="text-gray-600">À bientôt sur UNIKCANDLE !</Text>
          </Section>

          <Section className="mt-8 pt-8 border-t border-gray-200">
            <Text className="text-gray-500 text-sm text-center">
              Cet email a été envoyé automatiquement, merci de ne pas y
              répondre.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ResetPasswordEmail.PreviewProps = {
  userFirstname: "Jean",
  resetPasswordLink: "https://unikcandle.com/reset-password?token=xxx",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;
