import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findConsumer = await this.customersRepository.findById(customer_id);
    if (!findConsumer) {
      throw new AppError('Customer ID not existing');
    }

    const findProduct = await this.productsRepository.findAllById(products);
    if (findProduct.length !== products.length) {
      throw new AppError('Products not existing');
    }

    const stock = products.filter(product => {
      const storedProduct = findProduct.find(
        oneProduct => oneProduct.id === product.id,
      );

      return (
        storedProduct &&
        storedProduct.id === product.id &&
        storedProduct.quantity - product.quantity < 0
      );
    });

    if (stock.length > 0) {
      throw new AppError('There is no stock for this product');
    }

    const productsInOrder = products.map(product => {
      return {
        product_id: product.id,
        price:
          findProduct[findProduct.findIndex(item => item.id === product.id)]
            .price,
        quantity: product.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer: findConsumer,
      products: productsInOrder,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateProductService;
