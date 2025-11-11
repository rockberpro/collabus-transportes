import { PrismaClient } from '@prisma/client'

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

    if (!user.companyId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não vinculado a uma empresa',
      })
    }

    const company = await prisma.company.findUnique({
      where: {
        id: user.companyId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    })

    if (!company) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Empresa não encontrada',
      })
    }

    return {
      data: company,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao buscar empresa:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
