
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }
 

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartProducts: true },
    });

    // Check if the cart exists 
    if (!cart || cart.cartProducts.length === 0) {
      throw new Error('Cart is empty or does not exist');
    }

    // Create a new order with the products
    const order = await this.prisma.order.create({
      data: {
        userId: userId,
        status: 'Pending',
        orderProducts: {
          create: cart.cartProducts.map(cartProduct => ({
            productId: cartProduct.productId,
            quantity: cartProduct.quantity,
          })),
        },
      },
    });

    // Delete all cart products after creating the order
    await this.prisma.cartProduct.deleteMany({
      where: { cartId: cart.cartId },
    });

    return order;
  }

  async getOrder(orderId: number) {
    // Check order exists
    const order = await this.prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    //return order
    return order
  }


  async updateOrderStatus(orderId: number, newStatus: string, updateOrderDto: UpdateOrderDto) {
    // Check order exists
    const order = await this.prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { orderId },
      data: { status: newStatus },
    });

    if (!updatedOrder)
      return 'status updating error'

    return updatedOrder;
  }


  async applyCoupon(userId: number, discountPercentage: number) {
    // get logged user cart
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        cartProducts: {
          include: {
            product: true, 
          },
        },
      },
    });

    if (!cart || cart.cartProducts.length === 0) {
      throw new NotFoundException('Cart is empty or does not exist');
    }

    // Calculate total amount
    const totalAmount = cart.cartProducts.reduce((total, cartProduct) =>
      total + (cartProduct.quantity * cartProduct.product.price), 0);

    // Create a new order with the products
    const order = await this.prisma.order.create({
      data: {
        userId: userId,
        status: 'Pending',
        orderProducts: {
          create: cart.cartProducts.map(cartProduct => ({
            productId: cartProduct.productId,
            quantity: cartProduct.quantity,
          })),
        },
      },
    });

    // Calculate the discount
    let discount = (totalAmount * discountPercentage) / 100;
    discount =  totalAmount - discount

    return { order, totalAmount ,discount};
  }
}
