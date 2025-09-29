import express, { urlencoded } from "express"
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.route.js";

const app = express();

// Basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded ({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/v1/healthcheck", healthCheckRouter);


app.get("/", (req, res) => {
    res.send("This is project management app");
})


export default app
