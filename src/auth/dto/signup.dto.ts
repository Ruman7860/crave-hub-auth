import { AuthProvider } from "../../../generated/prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  pic?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;
}