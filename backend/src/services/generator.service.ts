import crypto from 'crypto';

// ─── Dessert / Sweet-dish word lists ─────────────────────────────────────────

const DESSERTS = [
  'Tiramisu','Macaron','Brownie','Croissant','Cheesecake','Pavlova','Eclair',
  'Profiterole','Madeleine','Mille-Feuille','CremeBrulee','PannaCotta',
  'Baklava','Halva','Gulab-Jamun','Rasgulla','Jalebi','Kheer','Ladoo',
  'Barfi','Halwa','Kulfi','Shrikhand','Modak','Peda','Imarti','Rabri',
  'Sandesh','Mishti-Doi','Kaaju-Katli','Churros','Flan','Alfajor',
  'Brigadeiro','Tres-Leches','Churro','Mochi','Dorayaki','Taiyaki',
  'Anmitsu','Daifuku','Castella','Youkan','Waffles','Stroopwafel',
  'Speculoos','Oliebollen','Hagelslag','Prinsestaart','Cannoli',
  'Panna','Sfogliatella','Granita','Zabaglione','Torrone','Panettone',
  'Strudel','Sachertorte','Linzertorte','Palatschinken','Knafeh',
  'Basbousa','Kunafa','Muhallebi','Luqaimat','Lokma','Kadayif',
  'Sfouf','Mamoul','Asure','Ghorayeba','Baba-au-Rhum','Crepe',
  'Gateau','Mousse','Soufflé','Tarte-Tatin','Clafoutis','Mille-Crepe',
  'Fondant','Opera-Cake','Financier','Canele','Tuile','Chouquette',
  'Merveilleux','Paris-Brest','Mont-Blanc','Fraisier','Charlotte',
  'Profiteroles','Galette','Kouign-Amann','Brioche','Pain-Perdu',
  'Churinga','Pavlova','Meringue','Amaretti','Pizelle','Biscotti',
  'Gelato','Semifreddo','Cassata','Zabaione','Budino','Semifreddo',
  'Pudding','Trifle','Eton-Mess','Syllabub','Blancmange','Crumble',
  'Treacle-Tart','Bakewell','Banoffee','Eton-Mess','Scone','Fudge',
  'Shortbread','Dundee-Cake','Victoria-Sponge','Swiss-Roll',
  'Lamington','Pavlova','Tim-Tam','Anzac','Caramel-Slice','Sticky-Date',
  'Pecan-Pie','Key-Lime','Cheesecake','Red-Velvet','Carrot-Cake',
  'Hummingbird','Boston-Cream','Devil-Food','Angel-Food','Funnel-Cake',
  'Beignet','Praline','Divinity','Peanut-Brittle','Saltwater-Taffy',
  'Cotton-Candy','Rock-Candy','Marshmallow','Nougat','Toffee',
  'Butterscotch','Caramel','Truffle','Ganache','Bonbon',
];

const DESSERT_SYMBOLS = ['@', '#', '!', '$', '*', '&', '%'];
const DESSERT_ADJECTIVES = [
  'Sweet','Rich','Dark','Golden','Fluffy','Crispy','Silky','Creamy',
  'Luscious','Warm','Velvety','Sugary','Fudgy','Gooey','Glazed',
];

export function generateDessertPassword(): string {
  const dessert = DESSERTS[randomInt(DESSERTS.length)];
  // optionally prepend an adjective (~40% chance)
  const name = randomInt(10) < 4
    ? DESSERT_ADJECTIVES[randomInt(DESSERT_ADJECTIVES.length)] + dessert
    : dessert;
  const digits = String(randomInt(900) + 100); // 3-digit number
  const sym = DESSERT_SYMBOLS[randomInt(DESSERT_SYMBOLS.length)];
  // Shuffle symbol position: prefix or suffix
  return randomInt(2) === 0 ? `${name}${sym}${digits}` : `${name}${digits}${sym}`;
}

// ─── Standard random password ─────────────────────────────────────────────────

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
