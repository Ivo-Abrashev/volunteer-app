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
    subject: 'Потвърди имейла си за Volunity',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добре дошли във Volunity!</h2>
        <p>Благодарим ви за регистрацията. Моля, потвърдете вашия имейл адрес, като кликнете на бутона по-долу:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Потвърди имейл
          </a>
        </div>
        <p>Или копирайте този линк в браузъра си:</p>
        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
        <br>
        <p> С уважение,<br>Екипът на Volunity</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Ако не сте се регистрирали в нашата платформа, моля игнорирайте този имейл.
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
