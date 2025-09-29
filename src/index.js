import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./db/connection.js";

dotenv.config({
    path: ".env",
    quiet: true,
})

const port = process.env.PORT || 3000

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Project Management app is running on port http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database", error);
        process.exit(1);
    })
