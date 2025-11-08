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

    // Verificar permissões
    if (user.role !== Role.SUPERVISOR && user.role !== Role.ADMINISTRADOR) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado',
      })
    }

    const routeId = getRouterParam(event, 'id')
    
    if (!routeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da rota não fornecido',
      })
    }

    // Verificar se a rota existe
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!existingRoute) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Rota não encontrada',
      })
    }

    // Verificar se a rota tem schedules associados
    const schedulesCount = await prisma.schedule.count({
      where: { routeId },
    })

    if (schedulesCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Não é possível remover uma rota que possui horários cadastrados',
      })
    }

    await prisma.route.delete({
      where: { id: routeId },
    })

    return {
      message: 'Rota removida com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao remover rota:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
