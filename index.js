import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from "cookie-parser";

// import routes
import studentRouter from './routers/studentRoute.js';
import teacherRouter from './routers/teacherRoute.js';
import adminRouter from './routers/adminRoute.js';
import { DateTime } from 'luxon';



const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));

// cookie parser
app.use(cookieParser(

));

// cors
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

dotenv.config();

// use routes
app.use('/s',studentRouter); //studentRoute s= student
app.use('/t', teacherRouter); // teacherRoute t= teacher
app.use('/a', adminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});