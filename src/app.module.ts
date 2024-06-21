import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { CartModule } from './cart/cart.module';
import { CookieParserMiddleware } from './middlewares/cookie-parser.middleware';
import { JwtModule } from '@nestjs/jwt';
import { OrderModule } from './order/order.module';

@Module({
  imports: [AuthModule, PrismaModule, CartModule, JwtModule, OrderModule,],
  controllers: [AppController],
  providers: [AppService],
})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('cart', 'orders'); // Apply middleware globally or specify routes
  }
}