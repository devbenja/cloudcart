import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, Min } from 'class-validator';

export class AddCartItemDto {
    @ApiProperty({ example: '60f7c5b2f1a2b3c4d5e6f7a8', description: 'ID del producto (MongoDB)' })
    @IsMongoId()
    productId: string;

    @ApiProperty({ example: 2, description: 'Cantidad a agregar', minimum: 1 })
    @IsInt()
    @Min(1)
    qty: number;
}
