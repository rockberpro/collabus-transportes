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
    const query = getQuery(event)

    const search = query.search as string | undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    // Apenas motoristas podem acessar este endpoint
    if (user.role !== Role.MOTORISTA) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado - apenas motoristas',
      })
    }

    // Buscar todas as rotas designadas ao motorista
    const driverRoutes = await prisma.routeDriver.findMany({
      where: {
        driverId: user.id,
      },
      select: {
        routeId: true,
      },
    })

    const routeIds = driverRoutes.map(rd => rd.routeId)

    if (routeIds.length === 0) {
      // Motorista não tem rotas designadas
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      }
    }

    const where: any = {
      routeId: {
        in: routeIds
      }
    }

    // Busca textual
    if (search) {
      where.OR = [
        { routeCode: { contains: search, mode: 'insensitive' } },
        { route: { origin: { contains: search, mode: 'insensitive' } } },
        { route: { destination: { contains: search, mode: 'insensitive' } } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        include: {
          route: {
            select: {
              id: true,
              code: true,
              origin: true,
              destination: true,
              state: true,
              city: true,
              isActive: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.schedule.count({ where }),
    ])

    return {
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao buscar horários designados:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
