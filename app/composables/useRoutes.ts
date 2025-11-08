import type { Ref } from 'vue'
import type { PaginationInfo } from '~/types/common'

export interface Route {
  id: string
  code: string | null
  origin: string
  destination: string
  state: string
  city: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RoutesFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const useRoutes = () => {
  const routes: Ref<Route[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRoutes = async (filters: RoutesFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      
      if (filters.search) query.search = filters.search
      if (typeof filters.isActive !== 'undefined') query.isActive = filters.isActive
      if (filters.page) query.page = filters.page
      if (filters.limit) query.limit = filters.limit

      const response = await $fetch('/api/routes', {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        routes.value = (response as any).data
        pagination.value = (response as any).pagination
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar rotas'
      console.error('Erro ao buscar rotas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addRoute = async (data: {
    code: string
    origin: string
    destination: string
    state: string
    city: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/routes', {
        method: 'POST' as any,
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao adicionar rota'
      console.error('Erro ao adicionar rota:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRoute = async (
    routeId: string,
    data: {
      code?: string
      origin?: string
      destination?: string
      state?: string
      city?: string
      isActive?: boolean
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/routes/${routeId}`, {
        method: 'PATCH' as any,
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao atualizar rota'
      console.error('Erro ao atualizar rota:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeRoute = async (routeId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/routes/${routeId}`, {
        method: 'DELETE' as any,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao remover rota'
      console.error('Erro ao remover rota:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    routes,
    pagination,
    loading,
    error,
    fetchRoutes,
    addRoute,
    updateRoute,
    removeRoute,
  }
}
