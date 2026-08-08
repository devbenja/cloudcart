import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from '../domain/product.schema';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(data: Partial<Product>): Promise<ProductDocument> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findAll(
    filter: FilterQuery<ProductDocument>,
    skip: number,
    limit: number,
  ): Promise<[ProductDocument[], number]> {
    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, data: Partial<Product>): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  /**
   * Descuenta stock de forma atómica usando $inc.
   * La condición `stock: { $gte: qty }` hace que la operación no aplique
   * si no hay stock suficiente (evita ventas por encima del stock bajo concurrencia).
   * Devuelve el documento actualizado, o null si no existe o no hay stock.
   */
  async decrementStock(
    id: string,
    qty: number,
  ): Promise<ProductDocument | null> {
    return this.productModel
      .findOneAndUpdate(
        { _id: id, stock: { $gte: qty }, isActive: true },
        { $inc: { stock: -qty } },
        { new: true },
      )
      .exec();
  }

  /** Devuelve stock (rollback de un descuento previo). */
  async incrementStock(id: string, qty: number): Promise<ProductDocument | null> {
    return this.productModel
      .findByIdAndUpdate(id, { $inc: { stock: qty } }, { new: true })
      .exec();
  }
}
