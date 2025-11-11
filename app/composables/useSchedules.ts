import type { Ref } from 'vue'
import type { PaginationInfo } from '~/types/common'

export interface Schedule {
  id: string
  routeCode: string
  state: string
  city: string
  times: any // JSON com os horários
  routeId: string
  createdAt: string
  updatedAt: string
  route: {
    id: string
    code: string | null
    origin: string
    destination: string
    state: string
    city: string
    isActive: boolean
  }
}

export interface SchedulesFilters {
  search?: string
  companyId?: string
  state?: string
  city?: string
  code?: string
  page?: number
  limit?: number
  myAssignments?: boolean // Se deve buscar apenas as designações do motorista
}

export const useSchedules = () => {
  const schedules: Ref<Schedule[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedules = async (filters: SchedulesFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      
      if (filters.search) query.search = filters.search
      if (filters.companyId) query.companyId = filters.companyId
      if (filters.state) query.state = filters.state
      if (filters.city) query.city = filters.city
      if (filters.code) query.code = filters.code
      if (filters.page) query.page = filters.page
      if (filters.limit) query.limit = filters.limit

      // Escolher endpoint baseado no contexto
      let endpoint = '/api/schedules'
      if (filters.myAssignments) {
        endpoint = '/api/schedules/my-assignments'
      } else if (!filters.companyId) {
        endpoint = '/api/schedules/by-company'
      }

      const response = await $fetch(endpoint, {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        schedules.value = (response as any).data
        pagination.value = (response as any).pagination || null
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar horários'
      console.error('Erro ao buscar horários:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    pagination,
    loading,
    error,
    fetchSchedules,
  }
}
