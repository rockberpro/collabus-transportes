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

    // Verificar se é administrador
    if (user.role !== Role.ADMINISTRADOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.',
      })
    }

    const query = getQuery(event)
    const search = query.search as string | undefined
    const companyId = query.companyId as string | undefined
    const isActive = query.isActive ? query.isActive === 'true' : undefined
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    // Construir filtros
    const where: any = {
      role: Role.SUPERVISOR,
    }

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive
    }

    if (companyId) {
      where.companyId = companyId
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

    // Buscar supervisores
    const [supervisors, total] = await Promise.all([
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
          company: {
            select: {
              id: true,
              name: true,
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
      data: supervisors.map(supervisor => ({
        id: supervisor.id,
        email: supervisor.email,
        isActive: supervisor.isActive,
        createdAt: supervisor.createdAt,
        person: supervisor.person,
        company: supervisor.company,
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

    console.error('Erro ao buscar supervisores:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
