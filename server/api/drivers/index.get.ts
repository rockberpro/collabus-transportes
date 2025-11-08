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

    // Verificar se é supervisor
    if (user.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado. Apenas supervisores podem acessar esta funcionalidade.',
      })
    }

    // Buscar dados completos do usuário para obter companyId
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true },
    })

    if (!currentUser?.companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Supervisor não está vinculado a nenhuma empresa',
      })
    }

    const query = getQuery(event)
    const search = query.search as string | undefined
    const isActive = query.isActive ? query.isActive === 'true' : undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    // Construir filtros
    const where: any = {
      companyId: currentUser.companyId,
      role: Role.MOTORISTA,
    }

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        {
          person: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    // Buscar motoristas
    const [drivers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          person: {
            select: {
              firstName: true,
              lastName: true,
              cpf: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return {
      data: drivers.map(driver => ({
        id: driver.id,
        email: driver.email,
        isActive: driver.isActive,
        createdAt: driver.createdAt,
        person: driver.person,
      })),
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

    console.error('Erro ao buscar motoristas:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
