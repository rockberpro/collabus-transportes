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

    const body = await readBody(event)
    const { vehicleId } = body

    if (!vehicleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do veículo é obrigatório',
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

    // Verificar se o veículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Veículo não encontrado',
      })
    }

    // Verificar se o supervisor está vinculado à mesma empresa do veículo
    if (user.role === Role.SUPERVISOR && user.companyId !== vehicle.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você só pode vincular veículos da sua empresa',
      })
    }

    // Verificar se já existe essa vinculação
    const existingAssignment = await prisma.routeVehicle.findUnique({
      where: {
        routeId_vehicleId: {
          routeId,
          vehicleId,
        },
      },
    })

    if (existingAssignment) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Este veículo já está vinculado a esta rota',
      })
    }

    // Criar vinculação
    const assignment = await prisma.routeVehicle.create({
      data: {
        routeId,
        vehicleId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
      },
    })

    return {
      message: 'Veículo vinculado à rota com sucesso',
      data: assignment,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao vincular veículo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
