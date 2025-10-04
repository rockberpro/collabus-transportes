import type { Person, CreatePersonData } from '../../types/person'

export const usePerson = () => {
    const getPersonByUserId = async (userId: string) => {
    try {
      const response = await $fetch<{ success: boolean; person: Person }>(
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

  return {
    getPersonByUserId,
    createPerson,
  };
};
