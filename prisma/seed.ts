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

  // Seed companies
  console.log('Seeding companies...')

  const companies = [
    { name: 'Sulvias' },
    { name: 'BusExpress' },
    { name: 'BrasRotas' },
  ]

  for (const c of companies) {
    await prisma.company.upsert({
      where: { name: c.name },
      update: { isActive: true, updatedAt: new Date() },
      create: { name: c.name, isActive: true },
    })
  }

  console.log('Companies seeded')

  // Get company references
  const sulvias = await prisma.company.findUnique({ where: { name: 'Sulvias' } })

  // Seed users: one per Role (ADMINISTRADOR, PASSAGEIRO, MOTORISTA, SUPERVISOR)
  console.log('Seeding users...')

  const usersData: Array<{
    email: string
    password: string
    role: Role
    firstName: string
    lastName: string
    cpf?: string
    companyId?: string
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
      companyId: sulvias?.id,
    },
    {
      email: 'supervisor@example.com',
      password: 'supervisor',
      role: Role.SUPERVISOR,
      firstName: 'Supervisor',
      lastName: 'User',
      cpf: '44444444444',
      companyId: sulvias?.id,
    },
    // Additional drivers for testing
    {
      email: 'driver2@example.com',
      password: 'driver',
      role: Role.MOTORISTA,
      firstName: 'João',
      lastName: 'Silva',
      cpf: '55555555555',
      companyId: sulvias?.id,
    },
    {
      email: 'driver3@example.com',
      password: 'driver',
      role: Role.MOTORISTA,
      firstName: 'Maria',
      lastName: 'Santos',
      cpf: '66666666666',
      companyId: sulvias?.id,
    },
    {
      email: 'passenger2@example.com',
      password: 'passenger',
      role: Role.PASSAGEIRO,
      firstName: 'Pedro',
      lastName: 'Oliveira',
      cpf: '77777777777',
      companyId: sulvias?.id,
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
        ...(u.companyId && {
          company: {
            connect: { id: u.companyId },
          },
        }),
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
        ...(u.companyId && {
          company: {
            connect: { id: u.companyId },
          },
        }),
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

  // Seed vehicles
  console.log('Seeding vehicles...')

  const busExpress = await prisma.company.findUnique({ where: { name: 'BusExpress' } })
  const brasRotas = await prisma.company.findUnique({ where: { name: 'BrasRotas' } })

  if (sulvias) {
    await prisma.vehicle.upsert({
      where: { plate: 'ABC-1234' },
      update: { brand: 'Mercedes-Benz', model: 'Sprinter', year: 2022, capacity: 20, companyId: sulvias.id, updatedAt: new Date() },
      create: { plate: 'ABC-1234', brand: 'Mercedes-Benz', model: 'Sprinter', year: 2022, capacity: 20, companyId: sulvias.id },
    })

    await prisma.vehicle.upsert({
      where: { plate: 'DEF-5678' },
      update: { brand: 'Iveco', model: 'Daily', year: 2021, capacity: 16, companyId: sulvias.id, updatedAt: new Date() },
      create: { plate: 'DEF-5678', brand: 'Iveco', model: 'Daily', year: 2021, capacity: 16, companyId: sulvias.id },
    })
  }

  if (busExpress) {
    await prisma.vehicle.upsert({
      where: { plate: 'GHI-9012' },
      update: { brand: 'Volkswagen', model: 'Volksbus', year: 2023, capacity: 25, companyId: busExpress.id, updatedAt: new Date() },
      create: { plate: 'GHI-9012', brand: 'Volkswagen', model: 'Volksbus', year: 2023, capacity: 25, companyId: busExpress.id },
    })

    await prisma.vehicle.upsert({
      where: { plate: 'JKL-3456' },
      update: { brand: 'Mercedes-Benz', model: 'OF-1721', year: 2020, capacity: 44, companyId: busExpress.id, updatedAt: new Date() },
      create: { plate: 'JKL-3456', brand: 'Mercedes-Benz', model: 'OF-1721', year: 2020, capacity: 44, companyId: busExpress.id },
    })
  }

  if (brasRotas) {
    await prisma.vehicle.upsert({
      where: { plate: 'MNO-7890' },
      update: { brand: 'Scania', model: 'K270', year: 2024, capacity: 46, companyId: brasRotas.id, updatedAt: new Date() },
      create: { plate: 'MNO-7890', brand: 'Scania', model: 'K270', year: 2024, capacity: 46, companyId: brasRotas.id },
    })
  }

  console.log('Vehicles seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
