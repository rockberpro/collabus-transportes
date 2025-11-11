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
    const routeId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { driverId } = body

    // Validar role do usuário
    if (user.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Apenas supervisores podem vincular motoristas',
      })
    }

    if (!user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Supervisor não vinculado a uma empresa',
      })
    }

    if (!routeId || !driverId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'routeId e driverId são obrigatórios',
      })
    }

    // Verificar se a rota existe
    const route = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!route) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Rota não encontrada',
      })
    }

    // Verificar se o motorista existe e pertence à mesma empresa
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    })

    if (!driver) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motorista não encontrado',
      })
    }

    if (driver.role !== Role.MOTORISTA) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Usuário não é um motorista',
      })
    }

    if (driver.companyId !== user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Motorista não pertence à sua empresa',
      })
    }

    if (!driver.isActive) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Motorista está inativo',
      })
    }

    // Verificar se já existe vinculação
    const existing = await prisma.routeDriver.findUnique({
      where: {
        routeId_driverId: {
          routeId,
          driverId,
        },
      },
    })

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Motorista já vinculado a esta rota',
      })
    }

    // Criar vinculação
    const routeDriver = await prisma.routeDriver.create({
      data: {
        routeId,
        driverId,
      },
      include: {
        driver: {
          select: {
            id: true,
            email: true,
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return {
      data: routeDriver,
      message: 'Motorista vinculado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao vincular motorista:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
