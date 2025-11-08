import type { Ref } from 'vue'
import type { PaginationInfo } from '~/types/common'

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  capacity: number
  isActive: boolean
  createdAt: string
  company: {
    id: string
    name: string
  }
}

export interface VehiclesFilters {
  search?: string
  companyId?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const useVehicles = () => {
  const vehicles: Ref<Vehicle[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchVehicles = async (filters: VehiclesFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      
      if (filters.search) query.search = filters.search
      if (filters.companyId) query.companyId = filters.companyId
      if (typeof filters.isActive !== 'undefined') query.isActive = filters.isActive
      if (filters.page) query.page = filters.page
      if (filters.limit) query.limit = filters.limit

      const response = await $fetch('/api/vehicles', {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        vehicles.value = (response as any).data
        pagination.value = (response as any).pagination
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar veículos'
      console.error('Erro ao buscar veículos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addVehicle = async (data: {
    plate: string
    brand: string
    model: string
    year: number
    capacity: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/vehicles', {
        method: 'POST',
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao adicionar veículo'
      console.error('Erro ao adicionar veículo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVehicle = async (
    vehicleId: string,
    data: {
      plate?: string
      brand?: string
      model?: string
      year?: number
      capacity?: number
      isActive?: boolean
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao atualizar veículo'
      console.error('Erro ao atualizar veículo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeVehicle = async (vehicleId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao remover veículo'
      console.error('Erro ao remover veículo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vehicles,
    pagination,
    loading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
  }
}
