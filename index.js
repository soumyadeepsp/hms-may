// create an express nodejs server
import express from 'express';
// import cors from 'cors'; // Uncomment this line if you want to use CORS
const app = express();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const port = 3000;
import cookieParser from 'cookie-parser';
import { signup, signin, 
    signout, sendOtpForVerifyingEmail, 
    verifyEmail, sendOtpForVerifyingMobile, 
    verifyMobile } from './controllers/auth_controllers.js';
import { checkAuthenticaion } from './middlewares/auth_middleware.js';
import { addDoctors, addTokensForAllDoctors, 
    searchDoctors, acceptFeeback, 
    setAvailableSlots
 } from './controllers/doctor_controllers.js';
import { bookAppointment } from './controllers/patient_controllers.js';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 
    REDIRECT_URI, JWT_SECRET } from './config/constants.js';
import axios from 'axios';
import qs from 'querystring';
import User from './models/user.js'; // Import the User model
import Session from './models/sessions.js'; // Import the Session model
import { signinHelperFunction } from './config/helper_functions.js'; // Import the helper function

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
app.get('/user/send-otp-verify-mobile', sendOtpForVerifyingMobile);
app.post('/user/verify-mobile', verifyMobile);

app.post('/add-doctors', addDoctors);
app.get('/add-tokens', addTokensForAllDoctors);

app.get('/search-doctors', searchDoctors);
app.post('/doctors/add-feedback', acceptFeeback);
app.post('/doctors/set-available-slots', setAvailableSlots);

app.post('/book-appointment', checkAuthenticaion, bookAppointment);

// this will be called when someone clicks on "continue with gogle"
app.get('/auth/google', (req, res) => {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');
  
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&access_type=offline`;
  
    res.redirect(redirectUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    console.log(code);
  
    try {
      // Exchange code for tokens
      console.log(GOOGLE_CLIENT_ID);
      console.log(GOOGLE_CLIENT_SECRET);
      console.log(REDIRECT_URI);
      const {data} = await axios.post(
        'https://oauth2.googleapis.com/token',
        qs.stringify({
          code: code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code', // ✅ Must be this exact string
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(data);
  
      const { access_token } = data;
  
      // Fetch user info
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      // You now have user info
    //   res.send(`
    //     <h1>Google User Info</h1>
    //     <pre>${JSON.stringify(userInfo.data, null, 2)}</pre>
    //   `);
    const email = userInfo.data.email;
    const name = userInfo.data.name;
    const password = userInfo.data.id; // Use Google ID as password for simplicity
    const userExists = await User.findOne({ email: email });
    console.log(userExists);
    if (userExists) {
        // // call the signin API using axios
        //     const user = await User.findOne({ email });
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
        return;
    }
      const user = new User({
        username: name,
        email: email,
        password: password,
        type: 'patient', // Default to patient, adjust as needed
        mobile: 0, // Mobile can be set later
        mobileVerified: false,
        emailVerified: true, // Email is verified through Google
      });
      await user.save();
  
      // Here you would typically save the user to your database
      // For example:
      // const newUser = await User.create(user);
  
      res.status(200).json({
        message: 'Google authentication successful',
        user: userInfo.data,
      });
    } catch (err) {
        console.error('Google Auth Error:', err.response?.data || err.message);
      res.status(500).send('Authentication failed');
    }
});

app.listen(port, (err) => {
    if (err) {
        console.log('Error starting server:', err);
        return;
    }
    console.log(`Server is running at http://localhost:${port}`);
});