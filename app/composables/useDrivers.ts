import type { Ref } from 'vue'
import type { AvailableUser, Company, PaginationInfo } from '~/types/common'

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

export interface DriversFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const useDrivers = () => {
  const drivers: Ref<Driver[]> = ref([])
  const availableUsers: Ref<AvailableUser[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const company: Ref<Company | null> = ref(null)
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
        credentials: 'include',
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

  const fetchCompany = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/drivers/company', {
        method: 'GET',
        credentials: 'include',
      })

      if (response && typeof response === 'object' && 'data' in response) {
        company.value = (response as any).data
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar empresa'
      console.error('Erro ao buscar empresa:', err)
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
    company,
    loading,
    error,
    fetchDrivers,
    fetchCompany,
    fetchAvailableUsers,
    addDriver,
    updateDriver,
    removeDriver,
  }
}
