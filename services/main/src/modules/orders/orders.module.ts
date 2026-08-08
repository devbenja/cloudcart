import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './application/orders.service';
import { OrdersRepository } from './infrastructure/orders.repository';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
    imports: [TypeOrmModule.forFeature([Order]), CartModule, CatalogModule],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService],
})
export class OrdersModule {}
