import express from "express";
import cors from "cors";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config();

const app = express();
app.use(cors());
app.use(express.static("public"));

const MEME_DIR = path.join(process.cwd(), "public/memes");

// Ensure meme directory exists
if (!fs.existsSync(MEME_DIR)) {
    fs.mkdirSync(MEME_DIR, { recursive: true });
}


app.get("/meme", (req, res) => {
    try {
        const files = fs.readdirSync(MEME_DIR);
        const memes = files.filter(file =>
            /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
        );

        if (memes.length === 0) {
            return res.status(500).json({ error: "No hay memes en el servidor." });
        }

        const random = memes[Math.floor(Math.random() * memes.length)];
        const baseUrl = process.env.BASE_URL || "https://meme-ap.netlify.app";
        const title = random.replace(/\.[^/.]+$/, ""); // Remove extension for title

        res.json({
            title: title,
            url: `${baseUrl}/memes/${random}`,
            author: "Desconocido"
        });
    } catch (error) {
        console.error("Error serving meme:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;

// Only listen if run directly (not imported)
if (process.env.dev) {
    app.listen(PORT, () => {
        console.log(`API de memes lista en el puerto ${PORT}`);
    });
}

export default app;
