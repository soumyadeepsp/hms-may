// create an express nodejs server
import express from 'express';
// import cors from 'cors'; // Uncomment this line if you want to use CORS
const app = express();
const port = 3000;

app.listen(port, (err) => {
    if (err) {
        console.log('Error starting server:', err);
        return;
    }
    console.log(`Server is running at http://localhost:${port}`);
});