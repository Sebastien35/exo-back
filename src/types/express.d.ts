// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken'; // Optional: or define your own type

declare module 'express' {
  interface Request {
    user?: JwtPayload | string; // Replace with your actual payload shape if needed
  }
}
