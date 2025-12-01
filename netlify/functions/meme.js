import fs from 'fs';
import path from 'path';

export const handler = async (event, context) => {
  try {
    const candidates = [
      path.join(process.cwd(), 'public/memes'),
      path.join(process.cwd(), '../../public/memes'),
      path.join(process.env.LAMBDA_TASK_ROOT || '', 'public/memes')
    ];

    let memeDir = null;
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        memeDir = dir;
        break;
      }
    }

    if (!memeDir) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Configuration error: Meme directory not found." })
      };
    }

    const files = fs.readdirSync(memeDir);
    const memes = files.filter(file =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );

    if (memes.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No hay memes en el servidor." })
      };
    }

    const random = memes[Math.floor(Math.random() * memes.length)];
    
    // Hardcoded Base URL as requested
    const baseUrl = "https://meme-ap.netlify.app";
    const title = random.replace(/\.[^/.]+$/, "");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        title: title,
        url: `${baseUrl}/memes/${random}`,
        author: "Desconocido"
      })
    };
  } catch (error) {
    console.error("Error serving meme:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
