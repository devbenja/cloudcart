import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddress } from '../../domain/order.entity';

export class ShippingAddressDto implements ShippingAddress {
    @ApiProperty({ example: 'Av. Libertador 1000' })
    @IsString()
    street: string;

    @ApiProperty({ example: 'Buenos Aires' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'CABA' })
    @IsString()
    state: string;

    @ApiProperty({ example: 'C1425BWN' })
    @IsString()
    zip: string;

    @ApiProperty({ example: 'AR' })
    @IsString()
    country: string;
}

export class UpdateShippingDto {
    @ApiProperty({ description: 'Dirección de envío' })
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @ApiPropertyOptional({ example: 'DHL' })
    @IsOptional()
    @IsString()
    carrier?: string;

    @ApiPropertyOptional({ example: 'DHL-1234567890' })
    @IsOptional()
    @IsString()
    trackingNumber?: string;
}
