import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  tenantId: string;
}