import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ProductsRepository } from '../infrastructure/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product, ProductDocument } from '../domain/product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    return this.productsRepository.create(dto);
  }

  async findAll(query: QueryProductDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ProductDocument> = { isActive: true };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [data, total] = await this.productsRepository.findAll(filter, skip, limit);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productsRepository.update(id, dto);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.remove(id);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
  }

  /**
   * Descuenta stock de forma atómica. Lanza 400 si el stock no alcanza
   * (la condición $gte en el update evita sobre-venta bajo concurrencia).
   */
  async decrementStock(id: string, qty: number): Promise<ProductDocument> {
    const product = await this.productsRepository.decrementStock(id, qty);
    if (!product) {
      const existing = await this.productsRepository.findById(id);
      if (!existing) {
        throw new NotFoundException(`Producto ${id} no encontrado`);
      }
      throw new BadRequestException(
        `Stock insuficiente para "${existing.name}": quedan ${existing.stock}`,
      );
    }
    return product;
  }

  /** Devuelve stock (rollback de un descuento previo). */
  async incrementStock(id: string, qty: number): Promise<ProductDocument> {
    const product = await this.productsRepository.incrementStock(id, qty);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  /** Categorías únicas del catálogo activo. */
  getCategories(): Promise<string[]> {
    return this.productsRepository.findCategories();
  }
}
