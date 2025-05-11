import { transporter } from './nodemailer.js';
import { COMPANY_EMAIL } from './constants.js';

export const sendEmail = async (email, subject, text) => {
    console.log(text);
    await transporter.sendMail({
        from: COMPANY_EMAIL,
        to: email,
        subject: subject,
        html: `<h2>${text}</h2>`, // you can send beautified text
    });
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};