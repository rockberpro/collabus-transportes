import type { UserWithoutPassword, UserWithPerson } from '../../types/user';
import type { User } from '../../types/user';

export const useUser = () => {
  const getUserById = async (userId: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: User }>(
        `/api/user/${userId}`,
        {
          method: "GET",
        }
      );

      return response;
    } catch (error) {
    throw error;
    }
  };

  const getUserWithPersonById = async (userId: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: UserWithoutPassword }>(
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
    getUserById,
    getUserWithPersonById,
  };
};