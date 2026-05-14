import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.OVH_EMAIL,
    pass: process.env.OVH_EMAIL_PASSWORD,
  },
});

export async function sendMail(options: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return transporter.sendMail(options);
}
