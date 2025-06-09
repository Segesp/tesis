import { Schema, model, Document } from 'mongoose';

export interface IPaper extends Document {
  filename: string;
  tikaId: string;
  text: string;
  metadata: Record<string, any>;
  uploadedAt: Date;
}

const paperSchema = new Schema<IPaper>({
  filename: { type: String, required: true },
  tikaId: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, required: true },
  uploadedAt: { type: Date, default: () => new Date() },
});

export const Paper = model<IPaper>('Paper', paperSchema);
