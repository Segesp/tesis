import axios from 'axios';
import { TIKA_URL } from '../config';

/**
 * Extrae el texto crudo de un buffer PDF usando Apache Tika
 * @param buffer Buffer del archivo PDF
 */
export async function extractText(buffer: Buffer): Promise<string> {
  const url = `${TIKA_URL}/tika`;
  const response = await axios.put<string>(url, buffer, {
    headers: { 'Content-Type': 'application/pdf' },
    responseType: 'text'
  });
  return response.data;
}

/**
 * Extrae metadatos de un buffer PDF usando Apache Tika
 * @param buffer Buffer del archivo PDF
 */
export async function extractMetadata(buffer: Buffer): Promise<any> {
  const url = `${TIKA_URL}/meta`;
  const response = await axios.put<any>(url, buffer, {
    headers: { 'Content-Type': 'application/pdf' }
  });
  return response.data;
}
