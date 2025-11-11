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
    const driverId = getRouterParam(event, 'driverId')

    // Validar role do usuário
    if (user.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Apenas supervisores podem desvincular motoristas',
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

    // Verificar se a vinculação existe
    const routeDriver = await prisma.routeDriver.findUnique({
      where: {
        routeId_driverId: {
          routeId,
          driverId,
        },
      },
      include: {
        driver: true,
      },
    })

    if (!routeDriver) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vinculação não encontrada',
      })
    }

    // Verificar se o motorista pertence à mesma empresa
    if (routeDriver.driver.companyId !== user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Motorista não pertence à sua empresa',
      })
    }

    // Deletar vinculação
    await prisma.routeDriver.delete({
      where: {
        routeId_driverId: {
          routeId,
          driverId,
        },
      },
    })

    return {
      message: 'Motorista desvinculado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao desvincular motorista:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
