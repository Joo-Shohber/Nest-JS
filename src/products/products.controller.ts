import type { JwtPayloadType } from './../utils/types';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dbo';
import { ProductsService } from './products.service';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { ApiQuery, ApiSecurity } from '@nestjs/swagger';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly ProductsService: ProductsService) {}

  @Post()
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public addProduct(
    @CurrentUser() payload: JwtPayloadType,
    @Body() product: CreateProductDto,
  ) {
    return this.ProductsService.CreateProduct(payload.id, product);
  }

  @Get()
  @ApiQuery({
    name: 'title',
    required: false,
    type: 'string',
    description: 'title for product',
    example: 'laptop',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'number',
    description: 'mim price for product',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'number',
    description: 'max price for product',
  })
  public getProducts(
    @Query('title') title: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    return this.ProductsService.getAll(title, minPrice, maxPrice);
  }

  @Get('/:id')
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.ProductsService.getOneBy(id);
  }

  @Put('/:id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: UpdateProductDto,
  ) {
    return this.ProductsService.update(id, product);
  }

  @Delete('/:id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.ProductsService.delete(id);
  }
}
