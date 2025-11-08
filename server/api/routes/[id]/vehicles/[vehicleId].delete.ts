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
    const vehicleId = getRouterParam(event, 'vehicleId')
    
    if (!routeId || !vehicleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDs da rota e veículo são obrigatórios',
      })
    }

    // Verificar se a vinculação existe
    const assignment = await prisma.routeVehicle.findUnique({
      where: {
        routeId_vehicleId: {
          routeId,
          vehicleId,
        },
      },
      include: {
        vehicle: true,
      },
    })

    if (!assignment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vinculação não encontrada',
      })
    }

    // Verificar se o supervisor está vinculado à mesma empresa do veículo
    if (user.role === Role.SUPERVISOR && user.companyId !== assignment.vehicle.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você só pode desvincular veículos da sua empresa',
      })
    }

    // Remover vinculação
    await prisma.routeVehicle.delete({
      where: {
        routeId_vehicleId: {
          routeId,
          vehicleId,
        },
      },
    })

    return {
      message: 'Veículo desvinculado da rota com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao desvincular veículo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
