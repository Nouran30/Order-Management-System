import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // @desc    Creates a new order for the specified user with the products in their cart.
  // @route   Post /api/orders
  @Post()
  createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = req['userId'];
    return this.orderService.createOrder(userId, createOrderDto);
  }

  // @desc    a feature for applying discounts and coupons to orders:
  // @route   POST /api/orders/apply-coupon
  @Post('apply-coupon')
  applyCoupon(@Req() req, @Body('discountPercentage') discountPercentage: number){
    const userId = req['userId'];
    return this.orderService.applyCoupon(userId,discountPercentage);
  }

  // @desc    Retrieves the order details by order ID.
  // @route   Get /api/orders/:orderId
  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(+id);
  }

  // @desc    Retrieves the user's cart.
  // @route  /api/orders/:orderId/status
  @Put(':orderId/status')
  updateOrderStatus(@Param('orderId') orderId: string, @Body('status') newStatus: string, @Body() updateOrderDto: UpdateOrderDto) {
    console.log(orderId);
    return this.orderService.updateOrderStatus(+orderId, newStatus ,updateOrderDto);
  }




}
