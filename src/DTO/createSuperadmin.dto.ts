// src/DTO/createSuperadmin.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateSuperadminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}