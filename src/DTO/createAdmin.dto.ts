import { IsEmail, IsString, MinLength, IsUUID, IsOptional  } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string | null;
}
