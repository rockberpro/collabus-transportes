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

    const body = await readBody(event)
    const { userId, companyId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do usuário é obrigatório',
      })
    }

    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Empresa é obrigatória para supervisores',
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
        statusMessage: 'Apenas passageiros podem ser promovidos a supervisor',
      })
    }

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Empresa não encontrada',
      })
    }

    // Promover usuário a supervisor e associar à empresa
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.SUPERVISOR,
        companyId: companyId,
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
        company: {
          select: {
            id: true,
            name: true,
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
        company: updatedUser.company,
      },
      message: 'Supervisor adicionado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao adicionar supervisor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
