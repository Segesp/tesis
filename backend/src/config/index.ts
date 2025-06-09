import dotenv from 'dotenv';

dotenv.config();

export const TIKA_URL = process.env.TIKA_URL || 'http://localhost:9998';
