import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './application/products.service';
import { CreateProductDto } from './application/dto/create-product.dto';
import { UpdateProductDto } from './application/dto/update-product.dto';
import { QueryProductDto } from './application/dto/query-product.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('catalog')
@Controller('products')
export class CatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un producto (solo admin)' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar productos con filtros y paginación (público)' })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener un producto por ID (público)' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar un producto (solo admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar un producto (solo admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
