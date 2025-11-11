import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    
    if (!session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Não autenticado',
      })
    }

    const user = session.user as any

    // Apenas Admin e Supervisor podem ver estatísticas
    if (user.role !== Role.ADMINISTRADOR && user.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado',
      })
    }

    let stats

    if (user.role === Role.ADMINISTRADOR) {
      // Admin vê estatísticas globais
      const [routesCount, driversCount, vehiclesCount, schedulesCount] = await Promise.all([
        prisma.route.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: Role.MOTORISTA, isActive: true } }),
        prisma.vehicle.count({ where: { isActive: true } }),
        prisma.schedule.count(),
      ])

      stats = {
        routes: routesCount,
        drivers: driversCount,
        vehicles: vehiclesCount,
        schedules: schedulesCount,
      }
    } else {
      // Supervisor vê apenas estatísticas da sua empresa
      if (!user.companyId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Usuário não vinculado a uma empresa',
        })
      }

      // Contar motoristas da empresa
      const driversCount = await prisma.user.count({
        where: {
          role: Role.MOTORISTA,
          isActive: true,
          companyId: user.companyId,
        },
      })

      // Contar veículos da empresa
      const vehiclesCount = await prisma.vehicle.count({
        where: {
          isActive: true,
          companyId: user.companyId,
        },
      })

      // Contar rotas que têm veículos da empresa
      const routesCount = await prisma.route.count({
        where: {
          isActive: true,
          vehicles: {
            some: {
              vehicle: {
                companyId: user.companyId,
              },
            },
          },
        },
      })

      // Contar horários das rotas da empresa
      const companyRoutes = await prisma.route.findMany({
        where: {
          vehicles: {
            some: {
              vehicle: {
                companyId: user.companyId,
              },
            },
          },
        },
        select: {
          id: true,
        },
      })

      const routeIds = companyRoutes.map(r => r.id)

      const schedulesCount = await prisma.schedule.count({
        where: {
          routeId: {
            in: routeIds,
          },
        },
      })

      stats = {
        routes: routesCount,
        drivers: driversCount,
        vehicles: vehiclesCount,
        schedules: schedulesCount,
      }
    }

    return {
      data: stats,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao buscar estatísticas:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
