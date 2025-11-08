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
        statusMessage: 'Acesso negado',
      })
    }

    const supervisorId = event.context.params?.id

    if (!supervisorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do supervisor é obrigatório',
      })
    }

    // Verificar se o supervisor existe
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId },
    })

    if (!supervisor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Supervisor não encontrado',
      })
    }

    if (supervisor.role !== Role.SUPERVISOR) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Usuário não é um supervisor',
      })
    }

    // Rebaixar supervisor para passageiro
    const updatedUser = await prisma.user.update({
      where: { id: supervisorId },
      data: {
        role: Role.PASSAGEIRO,
      },
      include: {
        person: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return {
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
      message: 'Supervisor removido com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao remover supervisor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
