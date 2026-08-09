import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './domain/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './application/reviews.service';
import { ReviewsRepository } from './infrastructure/reviews.repository';
import { OrdersModule } from '../orders/orders.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
    imports: [TypeOrmModule.forFeature([Review]), OrdersModule, CatalogModule],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsRepository],
    exports: [ReviewsService],
})
export class ReviewsModule {}
