import type { Person, CreatePerson } from '../../types/person'

export const usePerson = () => {
    const getPersonByUserId = async (userId: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: Person }>(
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

  const createPerson = async (personData: CreatePerson) => {
    try {
      const response = await $fetch<{ success: boolean; data: Person }>(
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

  const updatePerson = async (personId: string, updateData: Partial<CreatePerson>) => {
    try {
      const response = await $fetch<{ success: boolean }>(`/api/person/${personId}`, {
        method: 'PUT',
        body: updateData,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

   return {
     getPersonByUserId,
     createPerson,
     updatePerson,
   };
 };
