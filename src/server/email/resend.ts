import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
};

/**
 * Envoie un email via Resend.
 * Instancie le client à l'appel (pas au chargement du module) pour que
 * l'app reste utilisable sans RESEND_API_KEY configurée — le bouton
 * "Relancer" affichera alors une erreur claire plutôt qu'un crash au build.
 */
export async function sendEmail({ to, subject, html, replyTo, attachments }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Service d'email non configuré (RESEND_API_KEY / RESEND_FROM_EMAIL manquants)");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo,
    attachments,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email");
  }
}
