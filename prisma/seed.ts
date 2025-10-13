import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding routes...')

  const routesData = [
    { code: 'R-001', origin: 'Estação Rodoviária', destination: 'Praça Principal', state: 'RS', city: 'Lajeado' },
    { code: 'R-002', origin: 'Terminal Central', destination: 'Hospital Municipal', state: 'RS', city: 'Lajeado' },
    { code: 'R-003', origin: 'Rua das Flores', destination: 'Avenida Brasil', state: 'RS', city: 'Lajeado' },
  ]

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: r,
      create: r,
    })
  }

  console.log('Routes seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
