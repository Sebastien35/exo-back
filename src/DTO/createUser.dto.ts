import { IsEmail, IsString, MinLength, IsUUID, IsOptional  } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string | null;
}