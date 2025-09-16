import type { Person, CreatePersonData, PersonWithUser } from '../../types/person'

export const usePersons = () => {
  const createPerson = async (personData: CreatePersonData) => {
    try {
      const response = await $fetch<{ success: boolean; person: Person }>(
        "/api/person",
        {
          method: "POST",
          body: personData,
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
