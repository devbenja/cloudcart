import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email único del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John', description: 'Nombre' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: 'customer', enum: ['admin', 'customer'], description: 'Rol del usuario' })
  @IsOptional()
  @IsIn(['admin', 'customer'])
  role?: string;

  @ApiPropertyOptional({ description: 'ID del usuario en Keycloak' })
  @IsOptional()
  @IsString()
  keycloakId?: string;
}
