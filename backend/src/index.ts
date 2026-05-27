import 'dotenv/config';
import app from './app';
import { prisma } from './config/db';
import { seedDefaults } from './seed';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function bootstrap() {
  // Verify DB connection
  await prisma.$connect();
  console.log('✅ Database connected');

  // Seed entity types + default admin on first run
  await seedDefaults();

  app.listen(PORT, () => {
    console.log(`🚀 GenKeep API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
