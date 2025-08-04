import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isConfirmation?: boolean;
}

export const ContactFormEmail = ({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
  isConfirmation = false,
}: ContactFormEmailProps) => {
  const previewText = isConfirmation
    ? `Confirmation de votre message - ${subject}`
    : `Nouveau message de contact de ${firstName} ${lastName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              {isConfirmation ? (
                <>
                  <Heading className="text-2xl font-bold text-gray-900 mb-6">
                    Merci pour votre message !
                  </Heading>

                  <Text className="text-gray-700 mb-4">
                    Bonjour {firstName},
                  </Text>

                  <Text className="text-gray-700 mb-6">
                    Nous avons bien reçu votre message concernant{" "}
                    <strong>&quot;{subject}&quot;</strong>.
                  </Text>

                  <Text className="text-gray-700 mb-6">
                    Notre équipe va l&apos;examiner et vous répondre dans les
                    plus brefs délais (généralement sous 48h).
                  </Text>

                  <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                    <Heading className="text-lg font-semibold text-gray-900 mb-4">
                      Récapitulatif de votre message
                    </Heading>
                    <Text className="text-gray-700 mb-2">
                      <strong>Sujet:</strong> {subject}
                    </Text>
                    <Text className="text-gray-700 mb-4">
                      <strong>Message:</strong>
                    </Text>
                    <Section className="bg-white p-4 border border-gray-200 rounded">
                      <Text className="text-gray-700 whitespace-pre-wrap">
                        {message}
                      </Text>
                    </Section>
                  </Section>

                  <Text className="text-gray-700 mb-6">
                    En attendant notre réponse, n&apos;hésitez pas à consulter
                    notre{" "}
                    <Link
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/products`}
                      className="text-blue-600"
                    >
                      catalogue de produits
                    </Link>
                    .
                  </Text>

                  <Text className="text-gray-700 mb-6">
                    Cordialement,
                    <br />
                    L&apos;équipe UnikCandle
                  </Text>
                </>
              ) : (
                <>
                  <Heading className="text-2xl font-bold text-gray-900 mb-6">
                    Nouveau message de contact
                  </Heading>

                  <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                    <Heading className="text-lg font-semibold text-gray-900 mb-4">
                      Informations du contact
                    </Heading>
                    <Text className="text-gray-700 mb-2">
                      <strong>Nom complet:</strong> {firstName} {lastName}
                    </Text>
                    <Text className="text-gray-700 mb-2">
                      <strong>Email:</strong> {email}
                    </Text>
                    {phone && (
                      <Text className="text-gray-700 mb-2">
                        <strong>Téléphone:</strong> {phone}
                      </Text>
                    )}
                    <Text className="text-gray-700 mb-2">
                      <strong>Sujet:</strong> {subject}
                    </Text>
                  </Section>

                  <Section className="bg-white p-6 border border-gray-200 rounded-lg mb-6">
                    <Heading className="text-lg font-semibold text-gray-900 mb-4">
                      Message
                    </Heading>
                    <Text className="text-gray-700 whitespace-pre-wrap">
                      {message}
                    </Text>
                  </Section>

                  <Section className="bg-gray-50 p-4 rounded-lg">
                    <Text className="text-sm text-gray-600 mb-2">
                      Ce message a été envoyé depuis le formulaire de contact du
                      site UnikCandle.
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Date: {new Date().toLocaleString("fr-FR")}
                    </Text>
                  </Section>
                </>
              )}
            </Section>

            {isConfirmation && (
              <Section className="mt-6 text-center">
                <Text className="text-sm text-gray-500">
                  Cet email est envoyé automatiquement, merci de ne pas y
                  répondre.
                </Text>
              </Section>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactFormEmail;
