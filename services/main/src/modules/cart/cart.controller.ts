import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './application/cart.service';
import { AddCartItemDto } from './application/dto/add-cart-item.dto';
import { UpdateCartItemDto } from './application/dto/update-cart-item.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener el carrito del usuario autenticado' })
    getCart(@CurrentUser() user: AuthenticatedUser) {
        return this.cartService.getCart(user.id);
    }

    @Post('items')
    @ApiOperation({ summary: 'Agregar un producto al carrito' })
    @ApiResponse({ status: 201, description: 'Producto agregado' })
    @ApiResponse({ status: 400, description: 'Stock insuficiente o producto inactivo' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    addItem(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(user.id, dto);
    }

    @Patch('items/:productId')
    @ApiOperation({ summary: 'Actualizar cantidad de un ítem (0 lo elimina)' })
    updateItem(
        @CurrentUser() user: AuthenticatedUser,
        @Param('productId') productId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(user.id, productId, dto.qty);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
    removeItem(
        @CurrentUser() user: AuthenticatedUser,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(user.id, productId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Vaciar el carrito' })
    async clear(@CurrentUser() user: AuthenticatedUser) {
        await this.cartService.clear(user.id);
    }
}
