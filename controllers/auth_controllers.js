import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

export const signup = async (req, res) => {
    const { username, email, password, type, mobile } = req.body;
    const user = new User({ username, email, password, type, mobile });
    try {
        await user.save();
        return res.status(201).json({ message: 'You have signed up successfully. Please signin now.' });
    } catch (error) {
        return res.status(400).json({ error: 'Error creating user' });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
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
        return res.status(200).json({ message: 'Signin successful' });
    }
};

export const signout = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Signout successful' });
};