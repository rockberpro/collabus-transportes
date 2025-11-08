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
        statusMessage: 'Acesso negado',
      })
    }

    // Buscar companyId do supervisor
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

    const driverId = event.context.params?.id

    if (!driverId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do motorista é obrigatório',
      })
    }

    // Verificar se o motorista existe e pertence à empresa do supervisor
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    })

    if (!driver) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motorista não encontrado',
      })
    }

    if (driver.companyId !== currentUser.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não pode modificar motoristas de outra empresa',
      })
    }

    if (driver.role !== Role.MOTORISTA) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Usuário não é um motorista',
      })
    }

    const body = await readBody(event)
    const { isActive } = body

    // Atualizar motorista
    const updatedDriver = await prisma.user.update({
      where: { id: driverId },
      data: {
        ...(typeof isActive !== 'undefined' && { isActive }),
      },
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
    })

    return {
      data: {
        id: updatedDriver.id,
        email: updatedDriver.email,
        isActive: updatedDriver.isActive,
        createdAt: updatedDriver.createdAt,
        person: updatedDriver.person,
      },
      message: 'Motorista atualizado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao atualizar motorista:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
