import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_API);

export async function sendEmail(to, subject, html) {
    await resend.emails.send({
        from: 'nps@resend.dev',
        to: [to],
        subject: subject,
        html: html
});
}