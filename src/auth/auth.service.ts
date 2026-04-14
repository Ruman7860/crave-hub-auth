import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthProvider } from "../../generated/prisma/client";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { Role } from "./dto/addRole.dto";
import { google } from "googleapis";
import { GoogleConfigService } from "./config/google.config.service";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private googleConfig: GoogleConfigService
  ) { }

  async login(body, res) {
    try {
      console.log("entering logoin", body)
      const { email, password, provider, code } = body;

      let user: any;
      if(email){
        user = await this.prismaService.user.findUnique({
          where: { email },
        });
      }

      if (!provider || provider === AuthProvider.EMAIL) {
        if (!password) {
          throw new BadRequestException("Password is required field");
        }

        if (!user) {
          throw new BadRequestException("User not found");
        }

        // TODO: compare bcrypt password here
        const isPassMatch = bcrypt.compareSync(password, user.password as string);

        if (!isPassMatch) {
          throw new BadRequestException('Invalid credentials');
        }
      } else if (provider === AuthProvider.GOOGLE) {
        if (!code) {
          throw new BadRequestException("Google authentication failed. No code provided.");
        }

        try {
          const { clientId, clientSecret, callbackURL } = this.googleConfig.getGoogleConfig();
          const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, callbackURL);

          const { tokens } = await oauth2Client.getToken(code);
          console.log("Tokens from Google -> ",tokens)
          oauth2Client.setCredentials(tokens);

          const userRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${tokens.access_token}`);

          const payload = await userRes.json();
          console.log("Payload from Google -> ",payload)

          const { email: verifiedEmail, name: verifiedName, picture: verifiedPic, id: googleId } = payload;

          user = await this.prismaService.user.findUnique({
            where: { email: verifiedEmail },
          });

          if (!user) {
            user = await this.prismaService.user.create({
              data: {
                email: verifiedEmail,
                name: verifiedName,
                image: verifiedPic,
                provider,
                providerId: googleId,
              },
            });
          }
        } catch (error) {
          console.error("Google token verification failed:", error);
          throw new BadRequestException("Invalid Google authentication token.");
        }
      } else {
        throw new BadRequestException("Invalid Provider")
      }

      const { password: _, ...safeUser } = user;

      const accessToken = await this.jwtService.sign(safeUser);

      return {
        message: "Login successful",
        accessToken,
        user: safeUser,
      };

    } catch (error) {
      console.error("Error while login ->", error);
      throw error;
    }
  }

  async signup(body) {
    try {
      const { email, password, name, pic, provider } = body;

      if (provider && provider !== AuthProvider.EMAIL) {
        throw new BadRequestException("This signup method isn't supported. Please use your email to create an account.")
      }

      if (!email || !password) {
        throw new BadRequestException("Email and Password both are required.")
      }

      const hashedPassword = bcrypt.hashSync(password, 12);

      if (pic) {
        // TODO: add uploading image logic - S3 or Firebase Storage
      }

      const user = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          image: pic
        }
      });

      const { password: pass, ...result } = user;

      return {
        message: `User with ${email} signed up successfully`,
        data: result,
      };
    } catch (error) {
      console.error("Error while singup ->", error);
      throw error;
    }
  }

  async addRole(body, res) {
    try {
      const { id, role } = body;

      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const Roles = [Role.CUSTOMER, Role.SELLER, Role.RIDER];

      if (!Roles.includes(role)) {
        throw new BadRequestException("Invalid Role");
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          role: role,
        },
      });

      const { password: _, ...safeUser } = updatedUser;

      const token = await this.jwtService.sign(safeUser);
      
      return {
        message: "Roles added successfully",
        accessToken: token,
        user: safeUser,
      };
    } catch (error) {
      console.error("Error while adding roles ->", error);
      throw error;
    }
  }

  async myProfile(user) {
    try {
      return user;
    } catch (error) {
      console.error("Error while fetching profile ->", error);
      throw error;
    }
  }
}