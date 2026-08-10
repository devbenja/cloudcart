import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from './update-shipping.dto';

/**
 * Body opcional del checkout. La dirección de envío se pide ANTES del pago
 * (en la página del carrito), así que viaja con la creación de la orden.
 */
export class CreateOrderDto {
    @ApiPropertyOptional({
        description: 'Dirección de envío (se solicita antes del pago)',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress?: ShippingAddressDto;
}
