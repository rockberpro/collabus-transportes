import type { Person, CreatePerson } from "~~/types/person";

export const usePerson = () => {
  const getPersonByUserId = async (userId: string) => {
    return await $fetch<{ success: boolean; data: Person }>(
      `/api/user/${userId}/person`,
      {
        method: "GET",
      },
    );
  };

  const createPerson = async (personData: CreatePerson) => {
    return await $fetch<{ success: boolean; data: Person }>("/api/person", {
      method: "POST",
      body: personData,
    });
  };

  const updatePerson = async (
    personId: string,
    updateData: Partial<CreatePerson>,
  ) => {
    return await $fetch<{ success: boolean }>(`/api/person/${personId}`, {
      method: "PUT",
      body: updateData,
    });
  };

  return {
    getPersonByUserId,
    createPerson,
    updatePerson,
  };
};
