import { PrismaService } from './../../prisma/prisma.service';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/sigup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private readonly jwtService: JwtService,) { }

    async signup(signupDto: SignupDto) {
        const { name, email, password } = signupDto
        const user = await this.prisma.user.findUnique({ where: { email } })
        const hashedPassword = await this.hashPassword(password)

        if (user)
            return { message: 'email already exist' }

        await this.prisma.user.create({
            data: {
                name,
                email,
                hashedPassword
            }
        })
        return { message: 'signup successfully' }
    }

    async login(loginDto: LoginDto, req: Request, res: Response) {
        const { email, password } = loginDto
        const user = await this.prisma.user.findUnique({ where: { email } })

        if (!user || !await this.comparePassword({ password, hash: user.hashedPassword })) {
            throw new UnauthorizedException();
        }

        const payload = { userId: user.userId};
        const token = await this.jwtService.signAsync(payload, { secret: process.env.TOKEN_SECRET })

        if (!token)
            throw new ForbiddenException()
        res.cookie('token', token);
        return res.send({ message: 'login successfully' })
    }


    async signout() {
        return { message: 'signout route' }
    }


    async hashPassword(password) {
        const saltOrRounds = 10;
        return await bcrypt.hash(password, saltOrRounds)
    }

    async comparePassword(args: { password: string, hash: string }) {
        return await bcrypt.compare(args.password, args.hash)
    }

    async validateUser(userId: string) {
        return this.prisma.user.findUnique({ where: { email: userId } });
    }
}
