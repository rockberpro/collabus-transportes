import type { Ref } from 'vue'

export interface Driver {
  id: string
  email: string
  isActive: boolean
  createdAt: string
  person: {
    firstName: string
    lastName: string
    cpf?: string
    phone?: string
  } | null
}

export interface AvailableUser {
  id: string
  email: string
  person: {
    firstName: string
    lastName: string
    cpf?: string
    phone?: string
  } | null
}

export interface DriversFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const useDrivers = () => {
  const drivers: Ref<Driver[]> = ref([])
  const availableUsers: Ref<AvailableUser[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDrivers = async (filters: DriversFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      
      if (filters.search) query.search = filters.search
      if (typeof filters.isActive !== 'undefined') query.isActive = filters.isActive
      if (filters.page) query.page = filters.page
      if (filters.limit) query.limit = filters.limit

      const response = await $fetch('/api/drivers', {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        drivers.value = (response as any).data
        pagination.value = (response as any).pagination
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar motoristas'
      console.error('Erro ao buscar motoristas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableUsers = async (search?: string) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      if (search) query.search = search

      const response = await $fetch('/api/drivers/available', {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        availableUsers.value = (response as any).data
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar usuários disponíveis'
      console.error('Erro ao buscar usuários disponíveis:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addDriver = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/drivers', {
        method: 'POST',
        body: { userId },
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao adicionar motorista'
      console.error('Erro ao adicionar motorista:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDriver = async (driverId: string, data: { isActive?: boolean }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/drivers/${driverId}`, {
        method: 'PATCH',
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao atualizar motorista'
      console.error('Erro ao atualizar motorista:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeDriver = async (driverId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao remover motorista'
      console.error('Erro ao remover motorista:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    drivers,
    availableUsers,
    pagination,
    loading,
    error,
    fetchDrivers,
    fetchAvailableUsers,
    addDriver,
    updateDriver,
    removeDriver,
  }
}
