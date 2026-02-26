import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@coleta.com' },
    update: {},
    create: {
      email: 'admin@coleta.com',
      password: hashedPassword,
      name: 'Administrador',
    },
  });

  // Create initial materials
  const materials = [
    { name: 'Papel', category: 'Seco', description: 'Papéis, jornais, papelão.' },
    { name: 'Plástico', category: 'Seco', description: 'Garrafas PET, embalagens plásticas.' },
    { name: 'Vidro', category: 'Seco', description: 'Potes de conserva, garrafas de vidro.' },
    { name: 'Metal', category: 'Seco', description: 'Latas de alumínio, tampas metálicas.' },
    { name: 'Eletrônicos', category: 'Eletrônico', description: 'Pilhas, baterias, cabos, componentes.' },
  ];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { name: material.name },
      update: {},
      create: material,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
