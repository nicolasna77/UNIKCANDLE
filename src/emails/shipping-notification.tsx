import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

interface ShippingNotificationEmailProps {
  userName: string;
  userEmail: string;
  orderId: string;
  trackingNumber: string;
  trackingUrl: string;
  statusMessage: string;
  isDelivered: boolean;
}

export const ShippingNotificationEmail = ({
  userName,
  orderId,
  trackingNumber,
  trackingUrl,
  statusMessage,
  isDelivered,
}: ShippingNotificationEmailProps) => {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const title = isDelivered
    ? "Votre colis a été livré !"
    : "Votre colis est en route !";
  const preview = isDelivered
    ? `Commande #${shortOrderId} — votre bougie UNIKCANDLE est arrivée`
    : `Commande #${shortOrderId} — ${statusMessage}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{preview}</Preview>
        <Container style={container}>
          <Section style={message}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="120"
              height="40"
              alt="UnikCandle"
              style={{ margin: "auto" }}
            />
            <Heading style={heading}>{title}</Heading>

            <Text style={text}>
              Bonjour {userName},
            </Text>

            {isDelivered ? (
              <Text style={text}>
                Votre commande <strong>#{shortOrderId}</strong> vient d&apos;être
                livrée. Allumez votre bougie et laissez la magie opérer !
              </Text>
            ) : (
              <Text style={text}>
                Bonne nouvelle ! Votre commande <strong>#{shortOrderId}</strong>{" "}
                est en cours de livraison. Statut actuel :{" "}
                <strong>{statusMessage}</strong>.
              </Text>
            )}

            <Section style={trackingBox}>
              <Text style={trackingLabel}>Numéro de suivi</Text>
              <Text style={trackingNumber_}>
                {trackingNumber}
              </Text>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "24px" }}>
              <Button href={trackingUrl} style={button}>
                Suivre mon colis
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Une question ? Contactez-nous sur{" "}
              <a href={`${baseUrl}/contact`} style={link}>
                unikcandle.com/contact
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ShippingNotificationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const message = {
  padding: "0 40px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "24px 0",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#404040",
};

const trackingBox = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const trackingLabel = {
  fontSize: "12px",
  color: "#888",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const trackingNumber_ = {
  fontSize: "20px",
  fontWeight: "bold",
  fontFamily: "monospace",
  color: "#1a1a1a",
  margin: "0",
};

const button = {
  backgroundColor: "#1a1a1a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 32px",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "32px 0 24px",
};

const footer = {
  fontSize: "13px",
  color: "#888",
  textAlign: "center" as const,
};

const link = {
  color: "#1a1a1a",
};
