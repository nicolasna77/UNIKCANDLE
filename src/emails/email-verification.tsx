import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailVerificationProps {
  userFirstname?: string;
  verificationLink: string;
}

export const EmailVerificationEmail = ({
  userFirstname,
  verificationLink,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Vérifiez votre adresse email UNIKCANDLE</Preview>
    <Body className="bg-background text-foreground">
      <Container className="mx-auto py-8 px-4 max-w-[580px]">
        <Heading className="text-2xl font-semibold text-primary mb-6">
          Vérifiez votre adresse email
        </Heading>
        <Text className="text-base leading-relaxed mb-4">
          Bonjour {userFirstname},
        </Text>
        <Text className="text-base leading-relaxed mb-4">
          Merci de vous être inscrit sur UNIKCANDLE ! Pour finaliser votre
          inscription, veuillez vérifier votre adresse email en cliquant sur le
          bouton ci-dessous.
        </Text>
        <Section className="py-6">
          <Button
            href={verificationLink}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-base font-medium"
          >
            Vérifier mon email
          </Button>
        </Section>
        <Text className="text-base leading-relaxed mb-4">
          Si vous n&apos;avez pas créé de compte sur UNIKCANDLE, vous pouvez
          ignorer cet email.
        </Text>
        <Text className="text-base leading-relaxed mb-4">
          À bientôt,
          <br />
          L&apos;équipe UNIKCANDLE
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailVerificationEmail;