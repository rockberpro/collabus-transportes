import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async (event: H3Event) => {
  const routes = await prisma.route.findMany({
    where: { state: 'RS', city: 'Lajeado', isActive: true },
    orderBy: { code: 'asc' }
  })

  return { data: routes }
}
