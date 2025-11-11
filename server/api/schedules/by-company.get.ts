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

    // Motoristas só podem ver schedules da própria empresa
    if (user.role !== Role.MOTORISTA && user.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado',
      })
    }

    if (!user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Usuário não vinculado a uma empresa',
      })
    }

    // Buscar todas as rotas da empresa
    const companyRoutes = await prisma.route.findMany({
      where: {
        vehicles: {
          some: {
            vehicle: {
              companyId: user.companyId
            }
          }
        }
      },
      select: {
        id: true
      }
    })

    const routeIds = companyRoutes.map(route => route.id)

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

    console.error('Erro ao buscar horários:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
