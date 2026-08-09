import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 4, description: 'Puntaje de 1 a 5' })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ description: 'Comentario opcional de la reseña' })
    @IsOptional()
    @IsString()
    comment?: string;
}
