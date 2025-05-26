import { transporter } from './nodemailer.js';
import { COMPANY_EMAIL, SMS_API_KEY } from './constants.js';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import User from '../models/user.js';
import Session from '../models/sessions.js';

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

export const signinHelperFunction = async (email, password, req, res) => {
    // call the signin API using axios
    const user = await User.findOne({ email });
    if (!user) {
        // there is no user with this email
        return res.status(404).json({ error: 'No user found with this Email ID' });
    }
    const storedPassword = user.password; // this is the hashed password I have stored in the DB
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    } else {
        const token = jwt.sign({ email: user.email, password: user.password }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);
        // I will create a session for the user
        const session = new Session({
            userId: user._id,
            token: token,
            startTime: new Date(),
        });
        await session.save();
        return res.status(200).json({ message: 'Signin successful' });
    }
}