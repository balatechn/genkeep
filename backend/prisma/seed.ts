import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { encrypt } from '../src/services/crypto.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Entity Types ────────────────────────────────────────────────────────────
  const entityTypes = [
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

  for (const et of entityTypes) {
    await prisma.entityType.upsert({
      where: { code: et.code },
      update: {},
      create: et,
    });
  }
  console.log('✔  Entity types seeded');

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@genkeep.local' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@genkeep.local',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // ── Viewer user ─────────────────────────────────────────────────────────────
  const viewerHash = await bcrypt.hash('Viewer@123!', 12);
  await prisma.user.upsert({
    where: { email: 'viewer@genkeep.local' },
    update: {},
    create: {
      name: 'IT Viewer',
      email: 'viewer@genkeep.local',
      passwordHash: viewerHash,
      role: Role.VIEWER,
    },
  });
  console.log('✔  Users seeded  (admin@genkeep.local / Admin@123!)');

  // ── Sample entities ─────────────────────────────────────────────────────────
  const serverType   = await prisma.entityType.findUnique({ where: { code: 'server' } });
  const websiteType  = await prisma.entityType.findUnique({ where: { code: 'website' } });
  const deviceType   = await prisma.entityType.findUnique({ where: { code: 'device' } });
  const softwareType = await prisma.entityType.findUnique({ where: { code: 'software' } });
  const vendorType   = await prisma.entityType.findUnique({ where: { code: 'vendor' } });

  const serverBangalore = await prisma.entity.upsert({
    where: { id: 'entity-server-01' },
    update: {},
    create: { id: 'entity-server-01', entityTypeId: serverType!.id, name: 'CCTV NVR Bangalore', description: 'NVR for Bangalore office' },
  });

  const serverMumbai = await prisma.entity.upsert({
    where: { id: 'entity-server-02' },
    update: {},
    create: { id: 'entity-server-02', entityTypeId: serverType!.id, name: 'Web Server Mumbai', description: 'Production web server' },
  });

  const coreSite = await prisma.entity.upsert({
    where: { id: 'entity-web-01' },
    update: {},
    create: { id: 'entity-web-01', entityTypeId: websiteType!.id, name: 'Corporate Website', description: 'Main company portal' },
  });

  const router = await prisma.entity.upsert({
    where: { id: 'entity-device-01' },
    update: {},
    create: { id: 'entity-device-01', entityTypeId: deviceType!.id, name: 'Core Router', description: 'HQ network router' },
  });

  const erp = await prisma.entity.upsert({
    where: { id: 'entity-sw-01' },
    update: {},
    create: { id: 'entity-sw-01', entityTypeId: softwareType!.id, name: 'ERP System', description: 'Enterprise resource planning' },
  });

  const hostingVendor = await prisma.entity.upsert({
    where: { id: 'entity-vendor-01' },
    update: {},
    create: { id: 'entity-vendor-01', entityTypeId: vendorType!.id, name: 'AWS Cloud Account', description: 'Amazon Web Services' },
  });

  console.log('✔  Entities seeded');

  // ── Sample credentials ──────────────────────────────────────────────────────
  const sampleCreds = [
    { entityId: serverBangalore.id, title: 'NVR Admin',      urlOrIp: '192.168.1.10', username: 'admin',       password: 'Nv@r$ecure#2024',  notes: 'Main NVR admin credentials' },
    { entityId: serverMumbai.id,    title: 'SSH Root',        urlOrIp: '10.0.0.5',     username: 'root',        password: 'Ssh$2024!Mum',     notes: 'SSH access only from VPN' },
    { entityId: coreSite.id,        title: 'WordPress Admin', urlOrIp: 'https://corp.example.com/wp-admin', username: 'wpadmin', password: 'Wp@Corp#88!', notes: 'WP admin panel' },
    { entityId: router.id,          title: 'Router Panel',    urlOrIp: '192.168.0.1',  username: 'admin',       password: 'R0uter!HQ2024',    notes: 'Core switch admin' },
    { entityId: erp.id,             title: 'ERP Super Admin', urlOrIp: 'https://erp.internal', username: 'superadmin', password: 'Erp$uper#99', notes: 'ERP system root' },
    { entityId: hostingVendor.id,   title: 'AWS Root',        urlOrIp: 'https://aws.amazon.com', username: 'admin@company.com', password: 'Aws!R00t#2024', notes: 'AWS root – USE SPARINGLY' },
  ];

  for (const cred of sampleCreds) {
    const { ciphertext, iv, tag } = encrypt(cred.password);
    const { ciphertext: nc, iv: ni, tag: nt } = encrypt(cred.notes || '');

    await prisma.credential.create({
      data: {
        entityId: cred.entityId,
        title: cred.title,
        urlOrIp: cred.urlOrIp,
        username: cred.username,
        passwordEncrypted: ciphertext,
        passwordIv: iv,
        passwordTag: tag,
        notesEncrypted: nc,
        notesIv: ni,
        notesTag: nt,
        ownerId: admin.id,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✔  Sample credentials seeded');

  // ── Tags ────────────────────────────────────────────────────────────────────
  const tagNames = ['critical', 'network', 'server', 'cloud', 'web', 'internal'];
  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, color: '#6366f1' },
    });
  }
  console.log('✔  Tags seeded');

  console.log('\n✅ Seeding complete!');
  console.log('   Admin: admin@genkeep.local / Admin@123!');
  console.log('   Viewer: viewer@genkeep.local / Viewer@123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
