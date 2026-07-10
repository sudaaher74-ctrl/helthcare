import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma Error Handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with that unique field already exists (e.g., email).';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found in the database.';
    }
  }

  console.error(`[ERROR] ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
