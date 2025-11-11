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

    // Motoristas só podem ver veículos da própria empresa
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

    const where: any = {
      companyId: user.companyId
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

    console.error('Erro ao buscar veículos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
