import { Response, NextFunction } from 'express';
import { generatePassword, GeneratorOptions } from '../services/generator.service';
import { AuthRequest } from '../middleware/auth.middleware';

export function generate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const options: GeneratorOptions = {
      length:       parseInt(req.body.length) || 16,
      uppercase:    req.body.uppercase !== false,
      lowercase:    req.body.lowercase !== false,
      numbers:      req.body.numbers !== false,
      symbols:      req.body.symbols !== false,
      avoidSimilar: req.body.avoidSimilar === true,
    };
    const password = generatePassword(options);
    res.json({ password });
  } catch (err) {
    next(err);
  }
}
