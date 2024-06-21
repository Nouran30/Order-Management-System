
// cookie-parser.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies['token'];
            if (!token) {
                throw new Error('Token not found in cookies');
            }

            const payload = await this.jwtService.verifyAsync(token, { secret: process.env.TOKEN_SECRET });
            req['userId'] = payload.userId;
            next();
        } catch (error) {

            console.error('Error verifying JWT:', error.message);
            res.clearCookie('token');
            res.status(401).send('Unauthorized');
        }
    }
}
