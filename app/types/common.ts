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

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Company {
  id: string
  name: string
}
