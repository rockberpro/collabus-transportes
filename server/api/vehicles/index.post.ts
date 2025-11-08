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
    const { plate, brand, model, year, capacity } = body

    // Validações
    if (!plate || !brand || !model || !year || !capacity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todos os campos são obrigatórios',
      })
    }

    if (year < 1900 || year > new Date().getFullYear() + 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ano inválido',
      })
    }

    if (capacity < 1 || capacity > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Capacidade deve ser entre 1 e 100',
      })
    }

    // Supervisor só pode adicionar à própria empresa
    let companyId: string
    if (user.role === Role.SUPERVISOR) {
      if (!user.companyId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Supervisor não vinculado a uma empresa',
        })
      }
      companyId = user.companyId
    } else {
      // Administrador deve especificar a empresa (ou usar a sua se tiver)
      companyId = body.companyId || user.companyId
      if (!companyId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID da empresa é obrigatório',
        })
      }
    }

    // Verificar se a placa já existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate },
    })

    if (existingVehicle) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Já existe um veículo com esta placa',
      })
    }

    // Criar veículo
    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        year: parseInt(year),
        capacity: parseInt(capacity),
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return {
      message: 'Veículo adicionado com sucesso',
      data: vehicle,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao adicionar veículo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
