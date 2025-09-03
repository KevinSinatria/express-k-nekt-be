import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/v1", routes);
export default app;
