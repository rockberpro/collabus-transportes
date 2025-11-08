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

    const body = await readBody(event)
    const { isActive, companyId } = body

    const updateData: any = {}

    if (typeof isActive !== 'undefined') {
      updateData.isActive = isActive
    }

    if (companyId) {
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

      updateData.companyId = companyId
    }

    // Atualizar supervisor
    const updatedSupervisor = await prisma.user.update({
      where: { id: supervisorId },
      data: updateData,
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
        id: updatedSupervisor.id,
        email: updatedSupervisor.email,
        isActive: updatedSupervisor.isActive,
        createdAt: updatedSupervisor.createdAt,
        person: updatedSupervisor.person,
        company: updatedSupervisor.company,
      },
      message: 'Supervisor atualizado com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao atualizar supervisor:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
