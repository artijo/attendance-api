import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

// import routes
import testRouter from './routers/test.js';
import studentRouter from './routers/studentRoute.js';
import teacherRouter from './routers/teacherRoute.js';

const PORT = process.env.PORT || 3000;

const app = express();

// cors
app.use(cors());

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

dotenv.config();

// use routes
app.use('/test', testRouter);
app.use('/s',studentRouter); //studentRoute s= student
app.use('/t', teacherRouter); // teacherRoute t= teacher

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});