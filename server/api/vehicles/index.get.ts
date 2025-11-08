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
    const companyId = query.companyId as string | undefined
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    const where: any = {}

    // Supervisor só pode ver veículos da própria empresa
    if (user.role === Role.SUPERVISOR) {
      if (!user.companyId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Supervisor não vinculado a uma empresa',
        })
      }
      where.companyId = user.companyId
    } else if (user.role === Role.ADMINISTRADOR) {
      // Administrador pode filtrar por empresa
      if (companyId) {
        where.companyId = companyId
      }
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado',
      })
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
