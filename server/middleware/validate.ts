import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodSchema } from "zod";

export const validateResource =
  (schema: AnyZodObject | ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      // ZodError will be caught by global error handler if propagated
      // But here we might want to attach it to 'next'
      next(e);
    }
  };
