const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(to, verifyUrl) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
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
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Ако не сте се регистрирали в нашата платформа, моля игнорирайте този имейл.
        </p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };