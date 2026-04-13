import express from "express";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import cors from 'cors'
import connectDB from "./config/mongoDB.js";


const app = express();
const PORT = 8080;

//DataBase Connection;
connectDB();

// req.body data using.
app.use(express.json());
// cors backily use 
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/resume", resumeRouter);

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(PORT, () => {
  console.log("Server is Listing port:" + PORT);
});


