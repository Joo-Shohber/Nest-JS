import { UserService } from './../users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dbo';
import { Like, Between, Repository } from 'typeorm';
import { Product } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly userService: UserService,
  ) {}

  /**
   * Create New Product
   * @param userId of Login User (Admin)
   * @param CreateProductDto for Product
   * @returns Product
   */
  public async CreateProduct(userId: number, dto: CreateProductDto) {
    const user = await this.userService.getCurrentUser(userId);
    const newProduct = this.productsRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });
    return await this.productsRepository.save(newProduct);
  }

  /**
   * Get All Product
   * @returns All Products
   */
  public getAll(title?: string, minPrice?: string, maxPrice?: string) {
    const filter = {
      ...(title ? { title: Like(`%${title}%`) } : {}),
      ...(minPrice && maxPrice
        ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) }
        : {}),
    };
    return this.productsRepository.find({
      where: filter,
    });
  }

  /**
   * Get Single Product
   * @param id of Product
   * @returns Product
   */
  public async getOneBy(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  /**
   * Update Product
   * @param UpdateProductDto for Product
   * @param id of Product
   */
  public async update(id: number, dto: UpdateProductDto) {
    const product = await this.getOneBy(id);

    if (dto.title) product.title = dto.title.toLowerCase();
    product.description = dto.description ?? product.description;
    product.price = dto.price ?? product.price;

    return await this.productsRepository.save(product);
  }

  /**
   * Delete Product
   * @param id of Product
   * @returns Deleted Message
   */
  public async delete(id: number) {
    const product = await this.getOneBy(id);

    await this.productsRepository.remove(product);
    return { message: 'Product Deleted Successfully' };
  }
}
