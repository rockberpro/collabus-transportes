import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  // Seed users: one per Role (ADMINISTRADOR, PASSAGEIRO, MOTORISTA, SUPERVISOR)
  console.log('Seeding users...')

  const usersData: Array<{
    email: string
    password: string
    role: Role
    firstName: string
    lastName: string
    cpf?: string
  }> = [
    {
      email: 'admin@example.com',
      password: 'admin',
      role: Role.ADMINISTRADOR,
      firstName: 'Admin',
      lastName: 'User',
      cpf: '11111111111',
    },
    {
      email: 'passenger@example.com',
      password: 'passenger',
      role: Role.PASSAGEIRO,
      firstName: 'Passenger',
      lastName: 'User',
      cpf: '22222222222',
    },
    {
      email: 'driver@example.com',
      password: 'driver',
      role: Role.MOTORISTA,
      firstName: 'Driver',
      lastName: 'User',
      cpf: '33333333333',
    },
    {
      email: 'supervisor@example.com',
      password: 'supervisor',
      role: Role.SUPERVISOR,
      firstName: 'Supervisor',
      lastName: 'User',
      cpf: '44444444444',
    },
  ]

  for (const u of usersData) {
    const hashed = bcrypt.hashSync(u.password, 10)

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashed,
        role: u.role,
        isActive: true,
        updatedAt: new Date(),
        person: {
          upsert: {
            update: {
              firstName: u.firstName,
              lastName: u.lastName,
              cpf: u.cpf,
              updatedAt: new Date(),
            },
            create: {
              firstName: u.firstName,
              lastName: u.lastName,
              cpf: u.cpf,
            },
          },
        },
      },
      create: {
        email: u.email,
        password: hashed,
        role: u.role,
        isActive: true,
        person: {
          create: {
            firstName: u.firstName,
            lastName: u.lastName,
            cpf: u.cpf,
          },
        },
      },
    })
  }

  console.log('Users seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
