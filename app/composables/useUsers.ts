interface User {
  id?: string
  nome: string
  email: string
  tipo: string
  dataCriacao: Date
}

interface UserData {
  fullName: string
  email: string
  password: string
  passwordAgain: string
}

export const useUsers = () => {
  const signUp = async (userData: UserData) => {
    try {
      const response = await $fetch<{ success: boolean; user: User }>('/api/users/sign-up', {
        method: 'POST',
        body: userData
      })

      return response
    } catch (error) {
      throw error
    }
  }

  return {
    signUp
  }
}
