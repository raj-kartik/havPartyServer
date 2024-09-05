import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import userRoute from './routes/user.js';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

console.log('MONGO_URL:', process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Define routes
app.get("/", (req, res) => {
    res.send("I have connected to vercel");
});

app.use('/auth', userRoute);

app.listen(port, () => {
    console.log("-- listening on PORT", port);
});
