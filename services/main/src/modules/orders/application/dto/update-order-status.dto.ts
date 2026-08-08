import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../domain/order.entity';

export class UpdateOrderStatusDto {
    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.PAID,
        description: 'Nuevo estado de la orden',
    })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
