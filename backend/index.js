import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"

import { connectDB } from "./config/db.js"
import routes from "./routes/index.js"
dotenv.config()
const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods:["GET","PUT","DELETE","POST"],
    allowedHeaders:["Content-Type", "Authorization"]
}))
app.use(morgan("dev"))

//db connection
connectDB()
app.use(express.json())



const PORT = process.env.PORT || 5000

app.use("/api-v1",routes)
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    
})