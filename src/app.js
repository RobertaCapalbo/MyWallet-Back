import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import expressRouter from "./Routes/Routes.js"

const app = express()

app.use(express.json());
app.use(cors());
app.use(expressRouter);
dotenv.config();

const PORT = process.env.PORT || 5000 

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});