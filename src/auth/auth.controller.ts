import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { Public } from "./decorators/public.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AddRoleDto } from "./dto/addRole.dto";

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('auth/login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }

  @Public()
  @Post('auth/signup')
  signup(@Body() body: SignupDto){
    return this.authService.signup(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('auth/add-role')
  addRole(@Body() body: AddRoleDto, @Res({ passthrough: true }) res: Response){
    return this.authService.addRole(body, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  myProfile(@Req() req){
    console.log("user -> ", req.user);
    return this.authService.myProfile(req.user);
  }
}