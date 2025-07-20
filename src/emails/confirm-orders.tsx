import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";
import { Order } from "@/types/order";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

interface OrderConfirmationEmailProps {
  order: Order;
  userName: string;
  userEmail: string;
}

export const OrderConfirmationEmail = ({
  order,
  userName,
  userEmail,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Confirmation de votre commande UnikCandle</Preview>
        <Container style={container}>
          <Section style={message}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="120"
              height="40"
              alt="UnikCandle"
              style={{ margin: "auto" }}
            />
            <Heading style={global.heading}>
              Votre commande est confirmée !
            </Heading>
            <Text style={global.text}>
              Merci pour votre commande. Nous vous enverrons un email dès que
              votre commande sera expédiée.
            </Text>
          </Section>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Text style={adressTitle}>Livraison à : {userName}</Text>
            <Text style={{ ...global.text, fontSize: 14 }}>{userEmail}</Text>
          </Section>
          <Hr style={global.hr} />
          <Section
            style={{ ...paddingX, paddingTop: "40px", paddingBottom: "40px" }}
          >
            {order.items.map((item, index) => (
              <Row key={index}>
                <Column>
                  <Img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ float: "left" }}
                    width="260px"
                  />
                </Column>
                <Column style={{ verticalAlign: "top", paddingLeft: "12px" }}>
                  <Text style={{ ...paragraph, fontWeight: "500" }}>
                    {item.name}
                  </Text>
                  <Text style={global.text}>Senteur : {item.scentName}</Text>
                  <Text style={global.text}>Quantité : {item.quantity}</Text>
                  <Text style={global.text}>Prix : {item.price}€</Text>
                </Column>
              </Row>
            ))}
          </Section>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Row style={{ display: "inline-flex", marginBottom: 40 }}>
              <Column style={{ width: "170px" }}>
                <Text style={global.paragraphWithBold}>Numéro de commande</Text>
                <Text style={track.number}>{order.id}</Text>
              </Column>
              <Column>
                <Text style={global.paragraphWithBold}>Date de commande</Text>
                <Text style={track.number}>
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column align="center">
                <Link href={`${baseUrl}/profil/orders`} style={global.button}>
                  Voir le statut de la commande
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr style={global.hr} />
          <Section style={menu.container}>
            <Row>
              <Text style={menu.title}>Besoin d&apos;aide ?</Text>
            </Row>
            <Row style={menu.content}>
              <Column style={{ width: "33%" }} colSpan={1}>
                <Link href={`${baseUrl}/contact`} style={menu.text}>
                  Contactez-nous
                </Link>
              </Column>
              <Column style={{ width: "33%" }} colSpan={1}>
                <Link href={`${baseUrl}/faq`} style={menu.text}>
                  FAQ
                </Link>
              </Column>
              <Column style={{ width: "33%" }} colSpan={1}>
                <Link href={`${baseUrl}/return-policy`} style={menu.text}>
                  Retours & Échanges
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr style={global.hr} />
          <Section style={paddingY}>
            <Row>
              <Text style={footer.text}>
                © {new Date().getFullYear()} UnikCandle. Tous droits réservés.
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

const paddingX = {
  paddingLeft: "40px",
  paddingRight: "40px",
};

const paddingY = {
  paddingTop: "22px",
  paddingBottom: "22px",
};

const paragraph = {
  margin: "0",
  lineHeight: "2",
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: "bold" },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "-1px",
  } as React.CSSProperties,
  text: {
    ...paragraph,
    color: "#747474",
    fontWeight: "500",
  },
  button: {
    border: "1px solid #929292",
    fontSize: "16px",
    textDecoration: "none",
    padding: "10px 0px",
    width: "220px",
    display: "block",
    textAlign: "center",
    fontWeight: 500,
    color: "#000",
  } as React.CSSProperties,
  hr: {
    borderColor: "#E5E5E5",
    margin: "0",
  },
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "10px auto",
  width: "600px",
  maxWidth: "100%",
  border: "1px solid #E5E5E5",
};

const track = {
  container: {
    padding: "22px 40px",
    backgroundColor: "#F7F7F7",
  },
  number: {
    margin: "12px 0 0 0",
    fontWeight: 500,
    lineHeight: "1.4",
    color: "#6F6F6F",
  },
};

const message = {
  padding: "40px 74px",
  textAlign: "center",
} as React.CSSProperties;

const adressTitle = {
  ...paragraph,
  fontSize: "15px",
  fontWeight: "bold",
};

const menu = {
  container: {
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "20px",
    backgroundColor: "#F7F7F7",
  },
  content: {
    ...paddingY,
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  title: {
    paddingLeft: "20px",
    paddingRight: "20px",
    fontWeight: "bold",
  },
  text: {
    fontSize: "13.5px",
    marginTop: 0,
    fontWeight: 500,
    color: "#000",
  },
};

const footer = {
  text: {
    margin: "0",
    color: "#AFAFAF",
    fontSize: "13px",
    textAlign: "center",
  } as React.CSSProperties,
};
