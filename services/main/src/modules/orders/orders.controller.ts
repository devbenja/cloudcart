import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './application/orders.service';
import { UpdateOrderStatusDto } from './application/dto/update-order-status.dto';
import { UpdateShippingDto } from './application/dto/update-shipping.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una orden a partir del carrito (checkout)' })
    @ApiResponse({ status: 201, description: 'Orden creada' })
    @ApiResponse({ status: 400, description: 'Carrito vacío o stock insuficiente' })
    create(@CurrentUser() user: AuthenticatedUser) {
        return this.ordersService.create(user.id);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar órdenes (admin ve todas, usuario ve las suyas)',
    })
    findAll(
        @CurrentUser() user: AuthenticatedUser,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const isAdmin = user.roles.includes('admin');
        return this.ordersService.findAll(user.id, isAdmin, Number(page), Number(limit));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de una orden (dueño o admin)' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    @ApiResponse({ status: 403, description: 'Sin acceso a esta orden' })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const isAdmin = user.roles.includes('admin');
        return this.ordersService.findOne(id, user.id, isAdmin);
    }

    @Patch(':id/shipping')
    @ApiOperation({ summary: 'Completar dirección de envío (dueño de la orden)' })
    updateShipping(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateShippingDto,
    ) {
        return this.ordersService.updateShipping(id, user.id, dto);
    }

    @Patch(':id/status')
    @Roles('admin')
    @ApiOperation({ summary: 'Cambiar estado de la orden (máquina de estados, solo admin)' })
    @ApiResponse({ status: 200, description: 'Estado actualizado' })
    @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(id, dto.status);
    }
}
