import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sigup.dto';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // @desc    SignUp
  // @route   Post /auth/signup
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }

  // @desc    Login
  // @route   Post /auth/login
  @Post('login')
  login(@Body() logininDto: LoginDto, @Req() req, @Res() res) {
    return this.authService.login(logininDto, req , res)
  }

  @Get()
  signout() {
    return this.authService.signout()
  }


}
