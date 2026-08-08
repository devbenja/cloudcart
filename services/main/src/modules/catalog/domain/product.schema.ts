import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  /** Precio anterior (para mostrar descuento tachado). Opcional. */
  @Prop({ min: 0 })
  originalPrice?: number;

  /** Puntaje promedio 0–5 (marketplace). */
  @Prop({ min: 0, max: 5, default: 0 })
  rating: number;

  /** Cantidad de reseñas. */
  @Prop({ min: 0, default: 0 })
  reviewCount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índice de texto para búsqueda por nombre y descripción
ProductSchema.index({ name: 'text', description: 'text' });
