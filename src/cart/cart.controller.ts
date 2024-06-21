import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  // @desc Adds a product to the user's cart or updates the quantity if the product is already in the cart.
  // @route   Post /api/cart/add
  @Post('add')
  addProduct(@Body('productId') productId: number, @Body('quantity') quantity: number,
    @Req() req: Request, createCartDto: CreateCartDto) {
    const userId = req['userId']; // Retrieve userId from middleware
    return this.cartService.addProduct(createCartDto, userId, productId, quantity);
  }

  // @desc    Retrieves the user's cart.
  // @route   Get /api/cart/:userId
  @Get(':id')
  viewUserCart(@Param('id') id: string) {
    return this.cartService.viewUserCart(+id);
  }

  // @desc    Updates the quantity of a product in the cart.
  // @route   Put /api/cart/update
  @Put  ('update')
  update(@Req() req: Request,@Body('name') productname: string, @Body('quantity') quantity: number, updateCartDto: UpdateCartDto) { 
    const userId = req['userId'];
    return this.cartService.update(userId,productname, quantity, updateCartDto);
  }

  // @desc    Retrieves the user's cart.
  // @route   Delete /api/cart/remove/:productId
  @Delete('remove/:id')
  removeFromCart(@Param('id') id: string, @Req() req: Request) {
    const userId = req['userId'];
    return this.cartService.removeFromCart(+userId, +id);
  }
}
