// src/auth/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Pass the secret as part of an object
      });
      (request as any).user = payload; // Attach the payload to the request object
      return true;
    } catch (e) {
      console.error('JWT Verification Error:', e.message);
      throw new UnauthorizedException(`Invalid token: ${e.message}`);
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
