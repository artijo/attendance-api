import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// import routes
import parentRouter from "./routers/parentRouter.js";
import studentRouter from "./routers/studentRoute.js";
import teacherRouter from "./routers/teacherRoute.js";
import adminRouter from "./routers/adminRoute.js";
import authRouter from "./routers/authRouter.js";

// import middleware
import { isAuth } from "./middleware.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const environment = process.env.ENVIRONTMENT || "development";

const app = express();

app.use(express.static("public"));

// cookie parser
app.use(cookieParser());

// helmet
app.use(helmet());

// rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 50 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after a minute",
});
app.use(limiter);

// cors

const allowOrigin =
  environment === "production"
    ? [
        "https://manage.att.nps.ac.th",
        "https://teacher.att.nps.ac.th",
        "https://student.att.nps.ac.th",
        "https://nps-attendance-parent.netlify.app",
      ]
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:4321",
      ];

app.use(
  cors({
    origin: allowOrigin,
    credentials: true,
  })
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
environment === "development"
  ? app.use(morgan("dev"))
  : app.use(morgan("combined"));

// use routes
app.use("/auth", authRouter);
app.use("/s", isAuth, studentRouter); //studentRoute s= student
app.use("/t", isAuth, teacherRouter); // teacherRoute t= teacher
app.use("/a", isAuth, adminRouter);
app.use("/p", parentRouter); // parentRoute p= parent

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
