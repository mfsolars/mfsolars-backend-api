const mailer = require('nodemailer');

const sendEmail = async (options) => {

    const transporter = mailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
    const mailerOptions = {
        from: process.env.EMAIL_SENDER,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailerOptions);
}

module.exports = sendEmail;