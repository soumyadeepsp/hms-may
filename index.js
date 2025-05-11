// create an express nodejs server
import express from 'express';
// import cors from 'cors'; // Uncomment this line if you want to use CORS
const app = express();
const port = 3000;
import cookieParser from 'cookie-parser';
import { signup, signin, signout, sendOtpForVerifyingEmail, verifyEmail } from './controllers/auth_controllers.js';
import { checkAuthenticaion } from './middlewares/auth_middleware.js';

import './config/mongoose.js'; // import the mongoose config file
import './config/nodemailer.js'; // import the nodemailer config file

app.use(express.json());
app.use(cookieParser());

app.post('/user/signup', signup);
app.get('/user/signin', signin);
app.get('/', checkAuthenticaion, (req, res) => {
    res.send('Hello World!');
});
app.get('/user/signout', signout);
app.get('/user/send-otp-verify-email', sendOtpForVerifyingEmail);
app.post('/user/verify-email', verifyEmail);

app.listen(port, (err) => {
    if (err) {
        console.log('Error starting server:', err);
        return;
    }
    console.log(`Server is running at http://localhost:${port}`);
});