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

  // Seed schedules for some routes
  console.log('Seeding schedules...')
  const r1 = await prisma.route.findUnique({ where: { code: 'R-001' } })
  const r2 = await prisma.route.findUnique({ where: { code: 'R-002' } })

  if (r1) {
    await prisma.schedule.upsert({
      where: { routeCode_state_city: { routeCode: 'R-001', state: r1.state, city: r1.city } },
      update: { times: ['07:00', '09:00', '11:00'], routeId: r1.id },
      create: { routeCode: 'R-001', state: r1.state, city: r1.city, times: ['07:00', '09:00', '11:00'], routeId: r1.id },
    })
  }

  if (r2) {
    await prisma.schedule.upsert({
      where: { routeCode_state_city: { routeCode: 'R-002', state: r2.state, city: r2.city } },
      update: { times: ['08:30', '10:30', '13:00'], routeId: r2.id },
      create: { routeCode: 'R-002', state: r2.state, city: r2.city, times: ['08:30', '10:30', '13:00'], routeId: r2.id },
    })
  }

  console.log('Schedules seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
