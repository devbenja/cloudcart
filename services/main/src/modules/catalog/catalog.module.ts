import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './domain/product.schema';
import { CatalogController } from './catalog.controller';
import { ProductsService } from './application/products.service';
import { ProductsRepository } from './infrastructure/products.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [CatalogController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class CatalogModule {}
