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

interface ContactEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau message de contact - {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nouveau message de contact</Heading>

          <Section style={section}>
            <Text style={label}>De:</Text>
            <Text style={value}>{firstName} {lastName}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Téléphone:</Text>
            <Text style={value}>{phone}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Sujet:</Text>
            <Text style={value}>{subject}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 48px",
};

const section = {
  padding: "0 48px",
  marginBottom: "16px",
};

const label = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#666",
  margin: "0 0 4px 0",
};

const value = {
  fontSize: "16px",
  color: "#333",
  margin: "0 0 16px 0",
};

const messageText = {
  fontSize: "16px",
  color: "#333",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
  backgroundColor: "#f4f4f4",
  padding: "16px",
  borderRadius: "4px",
};
