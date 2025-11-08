import type { Ref } from 'vue'
import type { AvailableUser, Company, PaginationInfo } from '~/types/common'

export interface Supervisor {
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
  company: {
    id: string
    name: string
  } | null
}

export interface SupervisorsFilters {
  search?: string
  companyId?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const useSupervisors = () => {
  const supervisors: Ref<Supervisor[]> = ref([])
  const availableUsers: Ref<AvailableUser[]> = ref([])
  const companies: Ref<Company[]> = ref([])
  const pagination: Ref<PaginationInfo | null> = ref(null)
  const loading = ref(false)
  const loadingUsers = ref(false)
  const error = ref<string | null>(null)

  const fetchSupervisors = async (filters: SupervisorsFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const query: any = {}
      
      if (filters.search) query.search = filters.search
      if (filters.companyId) query.companyId = filters.companyId
      if (typeof filters.isActive !== 'undefined') query.isActive = filters.isActive
      if (filters.page) query.page = filters.page
      if (filters.limit) query.limit = filters.limit

      const response = await $fetch('/api/supervisors', {
        method: 'GET',
        query,
      })

      if (response && typeof response === 'object' && 'data' in response) {
        supervisors.value = (response as any).data
        pagination.value = (response as any).pagination
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar supervisores'
      console.error('Erro ao buscar supervisores:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableUsers = async (search?: string) => {
    loadingUsers.value = true
    error.value = null

    try {
      const query: any = {}
      if (search) query.search = search

      const response = await $fetch('/api/supervisors/available', {
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
      loadingUsers.value = false
    }
  }

  const fetchCompanies = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/supervisors/companies', {
        method: 'GET',
      })

      if (response && typeof response === 'object' && 'data' in response) {
        companies.value = (response as any).data
      }
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao buscar empresas'
      console.error('Erro ao buscar empresas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addSupervisor = async (userId: string, companyId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/supervisors', {
        method: 'POST',
        body: { userId, companyId },
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao adicionar supervisor'
      console.error('Erro ao adicionar supervisor:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSupervisor = async (supervisorId: string, data: { isActive?: boolean; companyId?: string }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/supervisors/${supervisorId}`, {
        method: 'PATCH',
        body: data,
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao atualizar supervisor'
      console.error('Erro ao atualizar supervisor:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeSupervisor = async (supervisorId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/supervisors/${supervisorId}`, {
        method: 'DELETE',
      })

      return response
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Erro ao remover supervisor'
      console.error('Erro ao remover supervisor:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    supervisors,
    availableUsers,
    companies,
    pagination,
    loading,
    loadingUsers,
    error,
    fetchSupervisors,
    fetchAvailableUsers,
    fetchCompanies,
    addSupervisor,
    updateSupervisor,
    removeSupervisor,
  }
}
