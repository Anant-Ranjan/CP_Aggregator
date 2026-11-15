import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { GatewayRequest } from '../types';

export const protect = (req: GatewayRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      req.userId = decoded.id;
      next();
      return;
    } catch {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }
  res.status(401).json({ message: 'Not authorised, no token' });
};
