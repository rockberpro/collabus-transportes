import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async (event: H3Event) => {
  const query = getQuery(event)
  
  const search = query.search as string | undefined
  const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
  const page = query.page ? parseInt(query.page as string) : 1
  const limit = query.limit ? parseInt(query.limit as string) : 10

  const where: any = {}

  // Filtro de busca por código, origem ou destino
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { origin: { contains: search, mode: 'insensitive' } },
      { destination: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Filtro de status
  if (isActive !== undefined) {
    where.isActive = isActive
  }

  // Se não houver filtros, usar os filtros padrão antigos
  if (!search && isActive === undefined && page === 1 && limit === 10) {
    where.state = 'RS'
    where.city = 'Lajeado'
    where.isActive = true
  }

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      orderBy: { code: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
              },
            },
          },
        },
      },
    }),
    prisma.route.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data: routes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}
