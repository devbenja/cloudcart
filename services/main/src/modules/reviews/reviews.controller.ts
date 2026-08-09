import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './application/reviews.service';
import { CreateReviewDto } from './application/dto/create-review.dto';
import { UpdateReviewDto } from './application/dto/update-review.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get('admin')
    @Roles('admin')
    @ApiOperation({ summary: 'Listar todas las reseñas (admin)' })
    findAllAdmin(
        @Query('page') page = '1',
        @Query('limit') limit = '50',
    ) {
        return this.reviewsService.findAllAdmin(Number(page), Number(limit));
    }

    @Get('product/:productId')
    @Public()
    @ApiOperation({ summary: 'Listar reseñas de un producto (público)' })
    findByProduct(
        @Param('productId') productId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.reviewsService.findByProduct(productId, Number(page), Number(limit));
    }

    @Post('product/:productId')
    @ApiOperation({ summary: 'Crear reseña para un producto' })
    @ApiResponse({ status: 201, description: 'Reseña creada' })
    create(
        @CurrentUser() user: AuthenticatedUser,
        @Param('productId') productId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.create(user.id, productId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Editar reseña (dueño o admin)' })
    update(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewsService.update(id, user.id, user.roles.includes('admin'), dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar reseña (dueño o admin)' })
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.reviewsService.remove(id, user.id, user.roles.includes('admin'));
    }
}
