import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum Role {
    CUSTOMER = "CUSTOMER",
    SELLER = "SELLER",
    RIDER = "RIDER"
}

export class AddRoleDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsEnum(Role, { message: "Invalid Role" })
    @IsNotEmpty()
    role: Role; 
}