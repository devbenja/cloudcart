import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
    @ApiProperty({
        example: 'b268b1a6-3fbb-4597-b732-8d2ea02905e6',
        description: 'ID de la orden pendiente a pagar',
    })
    @IsUUID()
    orderId: string;
}
