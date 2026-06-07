import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashed = await bcrypt.hash('admin123', 10);
await prisma.user.upsert({
  where: { email: 'admin@school.com' },
  update: {},
  create: {
    name: 'Admin',
    email: 'admin@school.com',
    password: hashed,
    role: 'admin',
  },
});

console.log('✅ Admin created: admin@school.com / admin123');
await prisma.$disconnect();

