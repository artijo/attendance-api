import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_API);

export async function sendEmail(to, subject, html) {
    const {data,error} = await resend.emails.send({
        from: 'NPS <no-reply@email.art-ohm.space>',
        to: [to],
        subject: subject,
        html: html
});

    if(error){
        console.error(error);
        return error;
    }
    return data;
}