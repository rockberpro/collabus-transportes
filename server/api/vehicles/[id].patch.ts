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

    const vehicleId = event.context.params?.id

    if (!vehicleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do veículo é obrigatório',
      })
    }

    // Buscar veículo
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Veículo não encontrado',
      })
    }

    // Supervisor só pode editar veículos da própria empresa
    if (user.role === Role.SUPERVISOR && vehicle.companyId !== user.companyId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não tem permissão para editar este veículo',
      })
    }

    const body = await readBody(event)
    const { plate, brand, model, year, capacity, isActive } = body

    const updateData: any = {}

    if (plate !== undefined) {
      // Verificar se a nova placa já existe em outro veículo
      if (plate !== vehicle.plate) {
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { plate },
        })

        if (existingVehicle) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Já existe um veículo com esta placa',
          })
        }
      }
      updateData.plate = plate
    }

    if (brand !== undefined) updateData.brand = brand
    if (model !== undefined) updateData.model = model
    
    if (year !== undefined) {
      const yearNum = parseInt(year)
      if (yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ano inválido',
        })
      }
      updateData.year = yearNum
    }

    if (capacity !== undefined) {
      const capacityNum = parseInt(capacity)
      if (capacityNum < 1 || capacityNum > 100) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Capacidade deve ser entre 1 e 100',
        })
      }
      updateData.capacity = capacityNum
    }

    if (typeof isActive !== 'undefined') updateData.isActive = isActive

    // Atualizar veículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
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
      message: 'Veículo atualizado com sucesso',
      data: updatedVehicle,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erro ao atualizar veículo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
