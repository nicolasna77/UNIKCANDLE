import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const NewsletterWelcomeEmail = () => (
  <Html>
    <Head />
    <Preview>Bienvenue dans l&apos;aventure UNIKCANDLE !</Preview>
    <Body className="bg-background text-foreground">
      <Container className="mx-auto py-8 px-4 max-w-[580px]">
        <Heading className="text-2xl font-semibold text-primary mb-6">
          Bienvenue dans l&apos;aventure UNIKCANDLE !
        </Heading>
        <Text className="text-base leading-relaxed mb-4">Bonjour,</Text>
        <Text className="text-base leading-relaxed mb-4">
          Nous sommes ravis de vous accueillir dans la communauté UNIKCANDLE.
          Votre inscription à notre newsletter a bien été enregistrée.
        </Text>
        <Text className="text-base leading-relaxed mb-4">
          Vous serez parmi les premiers à être informés du lancement de notre
          plateforme et à découvrir nos offres exclusives.
        </Text>
        <Section className="py-6">
          <Text className="text-base leading-relaxed mb-4">
            En attendant, découvrez notre concept unique de bougies
            personnalisées avec réalité augmentée.
          </Text>
        </Section>
        <Text className="text-base leading-relaxed mb-4">
          À très bientôt,
          <br />
          L&apos;équipe UNIKCANDLE
        </Text>
      </Container>
    </Body>
  </Html>
);

export default NewsletterWelcomeEmail;
