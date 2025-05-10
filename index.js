// create an express nodejs server
import express from 'express';
// import cors from 'cors'; // Uncomment this line if you want to use CORS
const app = express();
const port = 3000;
import { signup, signin } from './controllers/auth_controllers.js';

import './config/mongoose.js'; // import the mongoose config file

app.use(express.json());

app.post('/user/signup', signup);
app.get('/user/signin', signin);

app.listen(port, (err) => {
    if (err) {
        console.log('Error starting server:', err);
        return;
    }
    console.log(`Server is running at http://localhost:${port}`);
});