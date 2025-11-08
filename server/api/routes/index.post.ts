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

    const body = await readBody(event)
    const { code, origin, destination, state, city } = body

    // Validações
    if (!code || !origin || !destination || !state || !city) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todos os campos são obrigatórios',
      })
    }

    // Verificar se o código já existe
    if (code) {
      const existingRoute = await prisma.route.findUnique({
        where: { code },
      })

      if (existingRoute) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Já existe uma rota com este código',
        })
      }
    }

    // Criar rota
    const route = await prisma.route.create({
      data: {
        code: code.trim().toUpperCase(),
        origin: origin.trim(),
        destination: destination.trim(),
        state: state.trim().toUpperCase(),
        city: city.trim(),
        isActive: true,
      },
    })

    return {
      message: 'Rota criada com sucesso',
      data: route,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao criar rota:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
