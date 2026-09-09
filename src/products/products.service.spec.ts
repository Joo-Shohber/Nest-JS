import { ProductsService } from './products.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { UserService } from './../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: jest.Mocked<Repository<Product>>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: { getCurrentUser: jest.fn() },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(getRepositoryToken(Product));
    userService = module.get(UserService);
  });

  describe('CreateProduct', () => {
    test('should create a product successfully', async () => {
      const user = { id: 1 } as any;

      const dto = {
        title: 'Laptop',
        description: 'Gaming Laptop',
        price: 50000,
      };

      const product = {
        id: 1,
        ...dto,
        title: 'laptop',
        user,
      } as Product;

      userService.getCurrentUser.mockResolvedValue(user);
      productsRepository.create.mockReturnValue(product);
      productsRepository.save.mockResolvedValue(product);

      const result = await productsService.CreateProduct(1, dto);

      expect(userService.getCurrentUser).toHaveBeenCalledWith(1);

      expect(productsRepository.create).toHaveBeenCalledWith({
        ...dto,
        title: 'laptop',
        user,
      });

      expect(productsRepository.save).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });
  });

  describe('getAll', () => {
    test('should return all products', async () => {
      const products = [
        {
          id: 1,
          title: 'laptop',
          price: 50000,
        },
      ] as Product[];

      productsRepository.find.mockResolvedValue(products);

      const result = await productsService.getAll();

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: {},
      });

      expect(result).toEqual(products);
    });

    test('should filter products by title', async () => {
      const products = [
        {
          id: 1,
          title: 'laptop',
          price: 50000,
        },
      ] as Product[];

      productsRepository.find.mockResolvedValue(products);

      const result = await productsService.getAll('laptop');

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: {
          title: expect.anything(),
        },
      });

      expect(result).toEqual(products);
    });

    test('should filter products by price range', async () => {
      const products = [
        {
          id: 1,
          title: 'laptop',
          price: 50000,
        },
      ] as Product[];

      productsRepository.find.mockResolvedValue(products);

      const result = await productsService.getAll(undefined, '10000', '60000');

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: {
          price: expect.anything(),
        },
      });

      expect(result).toEqual(products);
    });
  });

  describe('getOneBy', () => {
    test('should return a product', async () => {
      const product = {
        id: 1,
        title: 'laptop',
        price: 50000,
      } as Product;

      productsRepository.findOne.mockResolvedValue(product);

      const result = await productsService.getOneBy(1);

      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(product);
    });

    test('should throw NotFoundException if product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(productsService.getOneBy(1)).rejects.toThrow(
        new NotFoundException('Product with id 1 not found'),
      );
    });
  });

  describe('update', () => {
    test('should update product successfully', async () => {
      const product = {
        id: 1,
        title: 'laptop',
        description: 'Old description',
        price: 50000,
      } as Product;

      const dto = {
        title: 'New Laptop',
        description: 'New description',
        price: 60000,
      };

      productsRepository.findOne.mockResolvedValue(product);
      productsRepository.save.mockResolvedValue({
        ...product,
        title: 'new laptop',
        description: 'New description',
        price: 60000,
      });

      const result = await productsService.update(1, dto);

      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(productsRepository.save).toHaveBeenCalledWith({
        id: 1,
        title: 'new laptop',
        description: 'New description',
        price: 60000,
      });

      expect(result).toEqual({
        id: 1,
        title: 'new laptop',
        description: 'New description',
        price: 60000,
      });
    });

    test('should throw NotFoundException if product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(
        productsService.update(1, {
          title: 'Laptop',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(productsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    test('should delete product successfully', async () => {
      const product = {
        id: 1,
        title: 'laptop',
        price: 50000,
      } as Product;

      productsRepository.findOne.mockResolvedValue(product);
      productsRepository.remove.mockResolvedValue(product);

      const result = await productsService.delete(1);

      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(productsRepository.remove).toHaveBeenCalledWith(product);

      expect(result).toEqual({
        message: 'Product Deleted Successfully',
      });
    });

    test('should throw NotFoundException if product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(productsService.delete(1)).rejects.toThrow(
        NotFoundException,
      );

      expect(productsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
