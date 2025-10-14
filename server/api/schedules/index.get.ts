import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async (event: H3Event) => {
  const url = new URL(event.req.url || '', 'http://localhost')
  const state = url.searchParams.get('state') || 'RS'
  const city = url.searchParams.get('city') || 'Lajeado'
  const code = url.searchParams.get('code') || undefined

  const where: any = { state, city }
  if (code) where.routeCode = code

  const schedules = await prisma.schedule.findMany({
    where,
    include: { route: true },
    orderBy: { createdAt: 'asc' }
  })

  return { data: schedules }
}
