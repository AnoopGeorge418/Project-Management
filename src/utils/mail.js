import mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const sendEmail = async(options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Project Management',
            link: "https://project-management.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transportor = nodemailer.createTransport({
        host: process.env.MAIL_TRAP_HOST,
        port: process.env.MAIL_TRAP_PORT,
        auth: {
            user: process.env.MAIL_TRAP_USER,
            pass: process.env.MAIL_TRAP_PASS}
    })

    const mail = {
        from: "mail.projectmanagement@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transportor.sendMail(mail);
    } catch (error) {
        console.error("Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file.");
        console.error(`Error: ${error}`);
    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to Project Management! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with your account, please click here:',
                button: {
                    color: '#224bbcff',
                    text: 'Confirm your account',
                    link: verificationUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: 'We received a request to reset your password.',
            action: {
                instructions: 'To reset your password, please click the button below:',
                button: {
                    color: '#0647f8ff',
                    text: 'Reset your password',
                    link: passwordResetUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}


export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}


