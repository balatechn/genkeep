import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ENTITY_TYPES = [
  { code: 'company',    label: 'Company',    icon: 'building-2' },
  { code: 'branch',     label: 'Branch',     icon: 'git-branch' },
  { code: 'department', label: 'Department', icon: 'users' },
  { code: 'vendor',     label: 'Vendor',     icon: 'package' },
  { code: 'client',     label: 'Client',     icon: 'briefcase' },
  { code: 'project',    label: 'Project',    icon: 'folder-open' },
  { code: 'server',     label: 'Server',     icon: 'server' },
  { code: 'software',   label: 'Software',   icon: 'cpu' },
  { code: 'website',    label: 'Website',    icon: 'globe' },
  { code: 'device',     label: 'Device',     icon: 'monitor' },
];

export async function seedDefaults(): Promise<void> {
  // Entity types (always upsert)
  for (const et of ENTITY_TYPES) {
    await prisma.entityType.upsert({ where: { code: et.code }, update: {}, create: et });
  }

  // Create admin only if no users exist
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const adminHash = await bcrypt.hash('Admin@123!', 12);
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@genkeep.local',
        passwordHash: adminHash,
        role: Role.ADMIN,
      },
    });
    console.log('✔  Default admin created  (admin@genkeep.local / Admin@123!)');
  }
}

// Allow running directly: node dist/seed.js
if (require.main === module) {
  seedDefaults()
    .then(() => { console.log('Seed complete'); process.exit(0); })
    .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
