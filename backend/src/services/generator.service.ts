import crypto from 'crypto';

export interface GeneratorOptions {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  avoidSimilar?: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS   = '0123456789';
const SYMBOLS   = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const SIMILAR   = /[0Oo1lIi|]/g;

export function generatePassword(options: GeneratorOptions = {}): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    avoidSimilar = false,
  } = options;

  if (length < 4 || length > 128) {
    throw new Error('Password length must be between 4 and 128');
  }

  let charset = '';
  const required: string[] = [];

  if (uppercase) {
    const pool = avoidSimilar ? UPPERCASE.replace(SIMILAR, '') : UPPERCASE;
    charset += pool;
    required.push(pool[randomInt(pool.length)]);
  }
  if (lowercase) {
    const pool = avoidSimilar ? LOWERCASE.replace(SIMILAR, '') : LOWERCASE;
    charset += pool;
    required.push(pool[randomInt(pool.length)]);
  }
  if (numbers) {
    const pool = avoidSimilar ? NUMBERS.replace(SIMILAR, '') : NUMBERS;
    charset += pool;
    required.push(pool[randomInt(pool.length)]);
  }
  if (symbols) {
    charset += SYMBOLS;
    required.push(SYMBOLS[randomInt(SYMBOLS.length)]);
  }

  if (!charset) throw new Error('At least one character set must be selected');

  const remaining = length - required.length;
  const passwordChars = [...required];

  for (let i = 0; i < remaining; i++) {
    passwordChars.push(charset[randomInt(charset.length)]);
  }

  // Shuffle using Fisher-Yates with crypto random
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
}

function randomInt(max: number): number {
  const bytes = crypto.randomBytes(4);
  return bytes.readUInt32BE(0) % max;
}
