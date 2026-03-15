const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function sendVerificationEmail(to, verifyUrl) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is missing');
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM is missing');
  }

  const sendPromise = resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    subject: 'Potvardi imeyla si za Volunity',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Dobre doshli vav Volunity!</h2>
        <p>Blagodarim vi za registratsiyata. Molya, potvurdete vashiya imeyl adres, kato kliknete na butona po-dolu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Potvardi imeyl
          </a>
        </div>
        <p>Ili kopirayte tozi link v brauzara si:</p>
        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Ako ne ste se registrirali v nashata platforma, molya ignorirayte tozi imeyl.
        </p>
      </div>
    `,
  });

  const timeoutMs = Number(process.env.RESEND_SEND_TIMEOUT_MS || 10000);
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Resend send timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    timer.unref?.();
  });

  return Promise.race([sendPromise, timeoutPromise]);
}

module.exports = { sendVerificationEmail };
