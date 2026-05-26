import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export function validate(schema: Schema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[target], { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => d.message);
      res.status(422).json({ error: 'Validation failed', details });
      return;
    }
    next();
  };
}
