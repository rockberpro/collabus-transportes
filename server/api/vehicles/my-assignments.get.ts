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
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined
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

    // Buscar veículos vinculados a essas rotas
    const where: any = {
      routes: {
        some: {
          routeId: {
            in: routeIds,
          },
        },
      },
    }

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          routes: {
            where: {
              routeId: {
                in: routeIds,
              },
            },
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
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.vehicle.count({ where }),
    ])

    return {
      data: vehicles,
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

    console.error('Erro ao buscar veículos designados:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
