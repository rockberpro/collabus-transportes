import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding routes...')

  const routesData = [
    { code: 'R-001', origin: 'Rodoviária Nova', destination: 'Praça da Matriz', state: 'RS', city: 'Lajeado' },
    { code: 'R-002', origin: 'Rodoviária Velha', destination: 'Hospital Bruno Born', state: 'RS', city: 'Lajeado' },
    { code: 'R-003', origin: 'Conventos', destination: 'Univates', state: 'RS', city: 'Lajeado' },
    { code: 'R-004', origin: 'Shopping', destination: 'São Cristóvão', state: 'RS', city: 'Lajeado' },
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
