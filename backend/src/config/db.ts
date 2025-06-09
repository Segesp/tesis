import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};
