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

    const vehicleId = event.context.params?.id

    if (!vehicleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do veículo é obrigatório',
      })
    }

    // Buscar veículo
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Veículo não encontrado',
      })
    }

    // Supervisor só pode remover veículos da própria empresa
    if (user.role === Role.SUPERVISOR && vehicle.companyId !== user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não tem permissão para remover este veículo',
      })
    }

    // Remover veículo
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    })

    return {
      message: 'Veículo removido com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao remover veículo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
