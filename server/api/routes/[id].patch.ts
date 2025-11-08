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
    const { code, origin, destination, state, city, isActive } = body

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

    // Se estiver atualizando o código, verificar se não está duplicado
    if (code && code !== existingRoute.code) {
      const duplicateRoute = await prisma.route.findUnique({
        where: { code },
      })

      if (duplicateRoute) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Já existe uma rota com este código',
        })
      }
    }

    const updateData: any = {}
    
    if (code !== undefined) updateData.code = code.trim().toUpperCase()
    if (origin !== undefined) updateData.origin = origin.trim()
    if (destination !== undefined) updateData.destination = destination.trim()
    if (state !== undefined) updateData.state = state.trim().toUpperCase()
    if (city !== undefined) updateData.city = city.trim()
    if (isActive !== undefined) updateData.isActive = isActive

    const route = await prisma.route.update({
      where: { id: routeId },
      data: updateData,
    })

    return {
      message: 'Rota atualizada com sucesso',
      data: route,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao atualizar rota:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
