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

    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do usuário é obrigatório',
      })
    }

    // Verificar se o usuário existe e é PASSAGEIRO
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
      })
    }

    if (targetUser.role !== Role.PASSAGEIRO) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Apenas passageiros podem ser promovidos a motorista',
      })
    }

    // Promover usuário a motorista e associar à empresa
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.MOTORISTA,
        companyId: currentUser.companyId,
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
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        person: updatedUser.person,
      },
      message: 'Motorista adicionado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao adicionar motorista:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
