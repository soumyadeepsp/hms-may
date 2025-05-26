import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import { sendEmail, generateOTP, sendSMS } from '../config/helper_functions.js';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 
    REDIRECT_URI
 } from '../config/constants.js';
import Session from '../models/sessions.js';

const client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: REDIRECT_URI // Optional, depends on your app type
});

export const signup = async (req, res) => {
    const { username, email, password, type, mobile } = req.body;
    const userPresent = await User.findOne({ email });
    if (userPresent) {
        // there is already a user with this email
        return res.status(409).json({ error: 'User with this email already exists' });
    }
    const user = new User({ username, email, password, type, mobile });
    try {
        await user.save();
        sendEmail(email, 'Welcome to our platform', `You have signed up successfully. Please click <a href="http://localhost:3000/user/verify-email?email=${email}">here</a> to verify your email.`);
        return res.status(201).json({ message: 'You have signed up successfully. Please signin now.' });
    } catch (error) {
        return res.status(400).json({ error: 'Error creating user' });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    // const user = await User.findOne({ email });
    // if (!user) {
    //     // there is no user with this email
    //     return res.status(404).json({ error: 'No user found with this Email ID' });
    // }
    // const storedPassword = user.password; // this is the hashed password I have stored in the DB
    // const isPasswordValid = await bcrypt.compare(password, storedPassword);
    // if (!isPasswordValid) {
    //     return res.status(401).json({ error: 'Invalid password' });
    // } else {
    //     const token = jwt.sign({ email: user.email, password: user.password }, JWT_SECRET, { expiresIn: '1h' });
    //     res.cookie('token', token);
    //     // I will create a session for the user
    //     const session = new Session({
    //         userId: user._id,
    //         token: token,
    //         startTime: new Date(),
    //     });
    //     await session.save();
    //     return res.status(200).json({ message: 'Signin successful' });
    // }
    signinHelperFunction(email, password, req, res);
};

export const signout = async (req, res) => {
    // I will delete the session from the DB
    const token = req.cookies.token;
    await Session.deleteOne({ token });
    res.clearCookie('token');
    return res.status(200).json({ message: 'Signout successful' });
};

export const sendOtpForVerifyingEmail = async (req, res) => {
    const otp = generateOTP();
    const email = req.query.email;
    console.log(email);
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'No user found with this email' });
    }
    user.otp = otp;
    await user.save();
    sendEmail(email, 'Verify your email', `Your OTP is ${otp}`);
    // I will delete the OTP after 30 seconds
    user.deleteOtp();
    return res.status(200).json({ message: 'OTP sent to your email' });
}

export const verifyEmail = async (req, res) => {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'No user found with this email' });
    }
    const storedPassword = user.password; // this is the hashed password I have stored in the DB
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    // if the password is valid, then I will check if the OTP is correct
    console.log(user.otp, otp);
    if (user.otp != otp) {
        return res.status(401).json({ error: 'Invalid OTP or the OTP has expired' });
    } else {
        // if the OTP is correct, then I will update the user in the DB
        user.emailVerified = true;
        user.otp = undefined; // remove the OTP from the DB
        await user.save();
        return res.status(200).json({ message: 'Email verified successfully' });
    }
};

export const sendOtpForVerifyingMobile = async (req, res) => {
    const otp = generateOTP();
    const mobile = req.query.mobile;
    console.log(mobile);
    const user = await User.findOne({ mobile });
    if (!user) {
        return res.status(404).json({ error: 'No user found with this mobile number' });
    }
    user.otp = otp;
    console.log(otp);
    await user.save();
    const response = await sendSMS(mobile, otp);
    // I will delete the OTP after 30 seconds
    user.deleteOtp();
    console.log(response);
    if (response.return==false) {
        return res.status(500).json({ error: 'Error sending OTP' });
    }
    return res.status(200).json({ message: 'OTP sent to your mobile' });
}

export const verifyMobile = async (req, res) => {
    const { mobile, password, otp } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) {
        return res.status(404).json({ error: 'No user found with this mobile number' });
    }
    const storedPassword = user.password; // this is the hashed password I have stored in the DB
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    // if the password is valid, then I will check if the OTP is correct
    console.log(user.otp, otp);
    if (user.otp != otp) {
        return res.status(401).json({ error: 'Invalid OTP or the OTP has expired' });
    } else {
        // if the OTP is correct, then I will update the user in the DB
        user.mobileVerified = true;
        user.otp = undefined; // remove the OTP from the DB
        await user.save();
        return res.status(200).json({ message: 'Mobile number verified successfully' });
    }
}