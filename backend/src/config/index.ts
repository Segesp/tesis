import dotenv from 'dotenv';

dotenv.config();

export const TIKA_URL = process.env.TIKA_URL || 'http://localhost:9998';
export const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const PORT = process.env.PORT || 4000;
