import { JWT_SECRET } from '../config/constants.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const checkAuthenticaion = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // if the token is not present, then the user should be redirected to the signin page
        return res.status(401).json({ error: 'You have been logged out.' });
    }
    // if the token exsts, then I will try to verify the token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'There is some error in the server. Please try later.' });
        }
        // my decoded data will be in this JSON format - { email: user.email, password: user.password }
        const email = decoded.email;
        const password = decoded.password;
        // I will use the email to find the user in the DB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'This is an invalid token' });
        }
        // if the user is found, then I will check if the password is correct
        if (user.password !== password) {
            return res.status(401).json({ error: 'This is an invalid token' });
        }
        // if the password is correct, then I will attach the user to the request object
        // this is because, if the user info is needed in the controller, I won't have to make further DB calls
        req.user = user;
        next();
    });
}