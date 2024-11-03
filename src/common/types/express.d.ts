import { Request } from 'express';
import { User } from '../user/user.model';
declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
    }
  }
}
