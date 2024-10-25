import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import players from "./routes/player.routes.js";


dotenv.config();
const app = express();

const corconfig={
    origin:"*",
    credential:true,
    methods:["GET","POST","PUT","DELETE"]
}

app.use(cors(corconfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Game leaderboard API" });
});

// database
connectDB()

app.use('/api',players);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});