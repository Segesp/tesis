import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import { extractText, extractMetadata } from './services/tikaClient';

const app = express();
app.use(cors());

// Configurar multer para recibir un solo archivo PDF
const upload = multer({
  dest: 'uploads/',
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'), false);
    }
    cb(null, true);
  }
});

// Asegurar carpeta de almacenamiento de resultados
async function ensureStorageDir() {
  const dir = path.resolve('storage');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creando directorio storage', err);
  }
}

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const filePath = path.resolve(req.file.path);
    // Leer buffer del PDF
    const buffer = await fs.readFile(filePath);

    // Extraer texto y metadatos
    const [text, metadata] = await Promise.all([
      extractText(buffer),
      extractMetadata(buffer)
    ]);

    // Asegurar directorio storage
    await ensureStorageDir();

    const baseName = path.parse(req.file.filename).name;
    const textPath = path.resolve(`storage/${baseName}.text.json`);
    const metaPath = path.resolve(`storage/${baseName}.meta.json`);

    // Guardar resultados como JSON
    await fs.writeFile(textPath, JSON.stringify({ text }, null, 2));
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));

    // Borrar archivo subido
    await fs.unlink(filePath);

    return res.status(201).json({
      message: 'PDF procesado correctamente',
      data: {
        id: baseName,
        metadata
      }
    });
  } catch (err: any) {
    console.error('Error al procesar PDF:', err);
    return res.status(500).json({ error: 'Error al procesar el PDF.' });
  }
});

// Healthcheck
app.get('/health', (_req, res) => res.send('OK'));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Backend escuchando en puerto ${PORT}`));
