import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import { extractText, extractMetadata } from './services/tikaClient';
import { connectDB } from './config/db';
import { Paper } from './models/Paper';

const app = express();
app.use(cors());

// Configurar multer para recibir un solo archivo PDF (modo test: permite text/plain)
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req: Request, file: any, cb: multer.FileFilterCallback) => {
    // Temporalmente permitir archivos de texto para pruebas
    if (file.mimetype !== 'application/pdf' && file.mimetype !== 'text/plain') {
      // Rechaza el archivo y pasa un error
      // El tipo de cb aquí espera un Error o `undefined` para el primer argumento
      return cb(new Error('Solo se permiten archivos PDF o texto para pruebas'));
    }
    // Acepta el archivo
    cb(null, true);
  }
});

app.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const filePath = path.resolve(req.file.path);
    const buffer = await fs.readFile(filePath);

    const [text, metadata] = await Promise.all([
      extractText(buffer),
      extractMetadata(buffer)
    ]);

    const baseName = path.parse(req.file.filename).name;

    const paper = await Paper.create({
      filename: req.file.originalname,
      tikaId: baseName,
      text,
      metadata,
    });

    await fs.unlink(filePath);

    return res.status(201).json({
      message: 'PDF procesado y guardado en MongoDB',
      paper
    });
  } catch (err: any) {
    console.error('Error al procesar PDF:', err);
    if (req.file && req.file.path) {
      try {
        await fs.unlink(path.resolve(req.file.path));
      } catch (unlinkErr) {
        console.error('Error borrando archivo temporal tras fallo:', unlinkErr);
      }
    }
    return res.status(500).json({ error: 'Error al procesar el PDF.', details: err.message });
  }
});

// Healthcheck
app.get('/health', (req: Request, res: Response) => res.send('OK'));

const PORT = Number(process.env.PORT) || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Backend escuchando en puerto ${PORT}`));
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
})();
