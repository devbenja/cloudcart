import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({ example: 3, description: 'Nueva cantidad (1+). 0 elimina el ítem.', minimum: 0 })
    @IsInt()
    @Min(0)
    qty: number;
}
