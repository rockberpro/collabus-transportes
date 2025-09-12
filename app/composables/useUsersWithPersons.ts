import type { User } from '../../types/user'
import type { Person, UserWithPersons } from '../../types/person'

export const useUsersWithPersons = () => {
  const { signUp: baseSignUp, signIn: baseSignIn } = useUsers();
  const { getPersonsByUserId } = usePersons();

  const signUpWithPerson = async (signUpData: any) => {
    try {
      // O sign-up já cria automaticamente uma person
      const response = await baseSignUp(signUpData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signInWithPersons = async (signInData: any): Promise<{ success: boolean; user: UserWithPersons }> => {
    try {
      const signInResponse = await baseSignIn(signInData);
      
      if (signInResponse.success && signInResponse.user.id) {
        // Buscar persons associadas ao usuário
        try {
          const personsResponse = await getPersonsByUserId(signInResponse.user.id);
          
          const userWithPersons: UserWithPersons = {
            ...signInResponse.user,
            persons: personsResponse.success ? personsResponse.persons : []
          };

          return {
            success: true,
            user: userWithPersons
          };
        } catch (personsError) {
          // Se falhar ao buscar persons, retorna usuário sem persons
          console.warn('Erro ao buscar persons do usuário:', personsError);
          
          const userWithPersons: UserWithPersons = {
            ...signInResponse.user,
            persons: []
          };

          return {
            success: true,
            user: userWithPersons
          };
        }
      }

      return signInResponse as { success: boolean; user: UserWithPersons };
    } catch (error) {
      throw error;
    }
  };

  const getUserWithPersons = async (userId: string): Promise<UserWithPersons | null> => {
    try {
      const personsResponse = await getPersonsByUserId(userId);
      
      if (personsResponse.success) {
        return {
          id: userId,
          email: '', // Seria necessário buscar do usuário se precisar
          type: 'passenger', // Seria necessário buscar do usuário se precisar
          createdAt: new Date(), // Seria necessário buscar do usuário se precisar
          token: '', // Seria necessário buscar do usuário se precisar
          persons: personsResponse.persons
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário com persons:', error);
      return null;
    }
  };

  return {
    signUpWithPerson,
    signInWithPersons,
    getUserWithPersons,
  };
};
