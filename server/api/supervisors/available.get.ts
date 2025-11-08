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

    const query = getQuery(event)
    const search = query.search as string | undefined

    // Buscar usuários disponíveis para serem promovidos a supervisor
    // (PASSAGEIRO, ativos)
    const where: any = {
      role: Role.PASSAGEIRO,
      isActive: true,
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            {
              person: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        },
      ]
    }

    const availableUsers = await prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return {
      data: availableUsers.map(u => ({
        id: u.id,
        email: u.email,
        person: u.person,
      })),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao buscar usuários disponíveis:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
