import type { Person, CreatePersonData, PersonWithUser } from '../../types/person'

export const usePersons = () => {
  const { getAuthHeaders } = useAuth()

  const createPerson = async (personData: CreatePersonData) => {
    try {
      const response = await $fetch<{ success: boolean; person: Person }>(
        "/api/person",
        {
          method: "POST",
          body: personData,
          headers: getAuthHeaders()
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  const getPersonsByUserId = async (userId: string) => {
    try {
      const response = await $fetch<{ success: boolean; persons: Person[] }>(
        `/api/user/${userId}/person`,
        {
          method: "GET",
          headers: getAuthHeaders()
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    createPerson,
    getPersonsByUserId
  };
};
