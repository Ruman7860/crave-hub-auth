import { AuthProvider } from '../../../generated/prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  pic?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  code?: string;
}