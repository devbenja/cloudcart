import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { ReviewsRepository } from '../infrastructure/reviews.repository';
import { OrdersService } from '../../orders/application/orders.service';
import { ProductsService } from '../../catalog/application/products.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from '../domain/review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
    ) {}

    /**
     * Crear reseña. Valida que el usuario haya comprado el producto
     * y que no tenga una reseña existente para ese producto.
     */
    async create(
        userId: string,
        productId: string,
        dto: CreateReviewDto,
    ): Promise<Review> {
        // Verificar que no exista ya una reseña de este usuario para este producto
        const existing = await this.reviewsRepository.findByUserAndProduct(
            userId,
            productId,
        );
        if (existing) {
            throw new ConflictException('Ya existe una reseña de este usuario para este producto');
        }

        // Verificar que el usuario haya comprado el producto (orden con status paid/delivered)
        const { data: orders } = await this.ordersService.findAll(
            userId,
            false,
            1,
            1000,
        );
        const hasPurchased = orders.some(
            (o) =>
                ['paid', 'delivered'].includes(o.status) &&
                (o.items as { productId: string }[]).some(
                    (item) => item.productId === productId,
                ),
        );
        if (!hasPurchased) {
            throw new BadRequestException(
                'Solo puedes reseñar productos que hayas comprado',
            );
        }

        const review = this.reviewsRepository.create({
            userId,
            productId,
            rating: dto.rating,
            comment: dto.comment ?? null,
        });
        const saved = await this.reviewsRepository.save(review);

        // Recalcular rating del producto
        await this.recalculateRating(productId);

        return saved;
    }

    async findByProduct(
        productId: string,
        page = 1,
        limit = 20,
    ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.reviewsRepository.findByProduct(
            productId,
            skip,
            limit,
        );
        return { data, total, page, limit };
    }

    async update(
        id: string,
        userId: string,
        isAdmin: boolean,
        dto: UpdateReviewDto,
    ): Promise<Review> {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException(`Reseña ${id} no encontrada`);
        }
        if (!isAdmin && review.userId !== userId) {
            throw new ForbiddenException('No puedes editar esta reseña');
        }

        if (dto.rating !== undefined) review.rating = dto.rating;
        if (dto.comment !== undefined) review.comment = dto.comment ?? null;

        const saved = await this.reviewsRepository.save(review);

        // Recalcular rating si cambió el rating
        if (dto.rating !== undefined) {
            await this.recalculateRating(review.productId);
        }

        return saved;
    }

    async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException(`Reseña ${id} no encontrada`);
        }
        if (!isAdmin && review.userId !== userId) {
            throw new ForbiddenException('No puedes eliminar esta reseña');
        }

        const productId = review.productId;
        await this.reviewsRepository.remove(id);
        await this.recalculateRating(productId);
    }

    async findAllAdmin(
        page = 1,
        limit = 50,
    ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.reviewsRepository.findAll(skip, limit);
        return { data, total, page, limit };
    }

    /**
     * Recalcula el rating promedio y el reviewCount del producto en MongoDB.
     * Se ejecuta tras crear o eliminar una reseña.
     */
    private async recalculateRating(productId: string): Promise<void> {
        const allReviews = await this.reviewsRepository.findByProduct(
            productId,
            0,
            10000,
        );
        const reviews = allReviews[0];
        const count = allReviews[1];

        if (count === 0) {
            // Sin reseñas: resetear rating a 0
            await this.productsService.updateRating(productId, 0, 0);
            return;
        }

        const avgRating =
            reviews.reduce((acc, r) => acc + r.rating, 0) / count;
        const rounded = Math.round(avgRating * 10) / 10; // 1 decimal
        await this.productsService.updateRating(productId, rounded, count);
    }
}
