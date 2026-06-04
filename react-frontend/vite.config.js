import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Serve partner logo images from the parent project's images/ folder
    {
      name: 'serve-parent-images',
      configureServer(server) {
        server.middlewares.use('/images', (req, res, next) => {
          const filePath = path.resolve(__dirname, '..', 'images', decodeURIComponent(req.url.replace(/^\//, '')));
          if (!fs.existsSync(filePath)) return next();
          const ext  = path.extname(filePath).toLowerCase();
          const mime = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.svg': 'image/svg+xml',
            '.mp4': 'video/mp4', '.webm': 'video/webm',
          };
          const contentType = mime[ext] || 'application/octet-stream';
          const stat = fs.statSync(filePath);
          const range = req.headers.range;
          if (range) {
            const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
            const start = parseInt(startStr, 10);
            const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': end - start + 1,
              'Content-Type': contentType,
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
            });
            fs.createReadStream(filePath).pipe(res);
          }
        });
      }
    }
  ]
});
