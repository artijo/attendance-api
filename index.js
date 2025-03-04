import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from "cookie-parser";

// import routes
import studentRouter from './routers/studentRoute.js';
import teacherRouter from './routers/teacherRoute.js';
import adminRouter from './routers/adminRoute.js';
import authRouter from './routers/authRouter.js';

// import middleware
import { isAuth } from './middleware.js';


dotenv.config();

const PORT = process.env.PORT || 3000;
const environment = process.env.ENVIRONTMENT || 'development';

const app = express();

app.use(express.static('public'));

// cookie parser
app.use(cookieParser(

));

// cors
app.use(cors(
    {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://manage.att.nps.ac.th', "https://teacher.att.nps.ac.th", "https://student.att.nps.ac.th"],
        credentials: true
    }
));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
environment === 'development' ? app.use(morgan('dev')) : app.use(morgan('combined'));

// use routes
app.use('/auth', authRouter);
app.use('/s',studentRouter); //studentRoute s= student
app.use('/t', isAuth, teacherRouter); // teacherRoute t= teacher
app.use('/a', isAuth, adminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});