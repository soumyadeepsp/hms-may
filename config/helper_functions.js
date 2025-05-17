import { transporter } from './nodemailer.js';
import { COMPANY_EMAIL, SMS_API_KEY } from './constants.js';
import axios from 'axios';

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
    // generates a random 6 digit number
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (mobile, otp) => {
    let response;
    // 'https://www.fast2sms.com/dev/bulkV2?authorization=sF7pv9an7OteS9APDCI7MmMJSu0lLybvFjR9VXN47MvcclP5FwifGjMHkIqZ&route=q&message=&flash=0&numbers=&schedule_time='
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${SMS_API_KEY}&route=q&message=Your OTP is ${otp}&flash=0&numbers=${mobile}`;
    try {
        response = await axios.get(url);
        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { error: 'Error sending SMS', return: false };
    }
}