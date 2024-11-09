import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

// import routes
import testRouter from './routers/test.js';

const PORT = process.env.PORT || 3000;

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

dotenv.config();

// use routes
app.use('/test', testRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});