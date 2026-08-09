import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../domain/review.entity';

@Injectable()
export class ReviewsRepository {
    constructor(
        @InjectRepository(Review)
        private readonly repo: Repository<Review>,
    ) {}

    create(data: Partial<Review>): Review {
        return this.repo.create(data);
    }

    async save(review: Review): Promise<Review> {
        return this.repo.save(review);
    }

    async findByProduct(
        productId: string,
        skip: number,
        take: number,
    ): Promise<[Review[], number]> {
        return this.repo.findAndCount({
            where: { productId },
            skip,
            take,
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Review | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByUserAndProduct(
        userId: string,
        productId: string,
    ): Promise<Review | null> {
        return this.repo.findOne({ where: { userId, productId } });
    }

    async remove(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findAll(skip: number, take: number): Promise<[Review[], number]> {
        return this.repo.findAndCount({
            skip,
            take,
            order: { createdAt: 'DESC' },
        });
    }
}
