import fs from 'fs';
import path from 'path';

export const handler = async (event, context) => {
  try {
    // In Netlify/Lambda, files included via `included_files` are usually relative to the function or CWD
    // We try a few common paths to be robust
    const candidates = [
      path.join(process.cwd(), 'public/memes'),
      path.join(process.cwd(), '../../public/memes'), // If CWD is the function dir (unlikely in newer Netlify)
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
      console.error("Meme directory not found. Searched:", candidates);
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
    
    // Determine Base URL dynamically
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      const host = event.headers.host || event.headers.Host;
      const protocol = event.headers['x-forwarded-proto'] || 'https';
      if (host) {
        baseUrl = `${protocol}://${host}`;
      } else {
        baseUrl = "https://meme-ap.netlify.app";
      }
    }
    
    const title = random.replace(/\.[^/.]+$/, "");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // CORS
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
