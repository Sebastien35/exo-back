import { IsEmail, IsOptional, IsUUID, IsString, MinLength } from 'class-validator';

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
