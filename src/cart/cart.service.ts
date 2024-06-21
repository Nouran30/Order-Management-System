import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService,) { }
  async addProduct(createCartDto: CreateCartDto, userId: number, productId: number, quantity: number) {
    // Find the user's cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartProducts: true },
    });

    // If the user doesn't have a cart, create one
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          cartProducts: {
            create: {
              productId,
              quantity,
            },
          },
        },
        include: { cartProducts: true },
      });
      return cart;
    }

    // Check if the product already in the cart
    const cartProduct = cart.cartProducts.find(cp => cp.productId === productId);

    // If the product in cart update quantity
    if (cartProduct) {
      await this.prisma.cartProduct.update({
        where: {
          cartProductId: cartProduct.cartProductId,
        },
        data: {
          quantity: cartProduct.quantity + quantity,
        },
      });
    } else {
      // If not in the cart, add it to the cart
      await this.prisma.cartProduct.create({
        data: {
          cartId: cart.cartId,
          productId,
          quantity,
        },
      });
    }

    // Return the updated cart
    cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartProducts: true },
    });

    return cart;

  }

  async viewUserCart(id: number) {

    // get user cart
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId: id,
      },
      include: {
        cartProducts: {
          include: {
            product: true, 
          },
        },
      },
    });

    //check cart exist
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return {
      cartId: cart.cartId,
      userId: cart.userId,
      products: cart.cartProducts.map(cartProduct => ({
        productId: cartProduct.product.productId,
        name: cartProduct.product.name,
        description: cartProduct.product.description,
        price: cartProduct.product.price,
        quantity : cartProduct.quantity
      })),
    };
  }

  async update(userId: number, productname: string, quantity: number, updateCartDto: UpdateCartDto) {
    const { productId } = await this.prisma.product.findFirst({ where: { name: productname } })
    // Find the user's cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartProducts: true },
    });

    const cartProduct = cart.cartProducts.find(cp => cp.productId === productId);

    // If the product in the cart, update the quantity
    if (cartProduct) {
      await this.prisma.cartProduct.update({
        where: {
          cartProductId: cartProduct.cartProductId,
        },
        data: {
          quantity: cartProduct.quantity + quantity,
        },
      });
    }
    else {
      return 'product not found'
    }

    // Return the updated cart
    cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartProducts: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });

    return cart;
  }

  async removeFromCart(userId: number, productId: number) {
    // Find the cart product to delete
    const { cartId } = await this.prisma.cart.findFirst({ where: { userId } })
    const cartProduct = await this.prisma.cartProduct.findFirst({
      where: {
        cartId,
        productId,
      },
    });

    if (!cartProduct) {
      throw new NotFoundException('Product not found in cart');
    }

    // Delete the cart product
    await this.prisma.cartProduct.delete({
      where: {
        cartProductId: cartProduct.cartProductId,
      },
    });

    return { message: 'Product removed from cart successfully' };
  }
}
