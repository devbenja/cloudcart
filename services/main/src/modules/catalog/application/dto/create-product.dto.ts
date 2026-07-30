import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Zapatilla Running Pro', description: 'Nombre del producto' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'Zapatilla ligera para running de larga distancia' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ example: 89.99, description: 'Precio del producto' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'footwear', description: 'Categoría del producto' })
  @IsString()
  @MinLength(1)
  category: string;

  @ApiPropertyOptional({ example: ['running', 'deportes'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 100, description: 'Stock disponible' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    example: { talla: 42, color: 'negro', material: 'malla' },
    description: 'Atributos flexibles según la categoría',
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/img1.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
