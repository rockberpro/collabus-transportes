import type { User, UserWithoutPassword } from "~~/types/user";

export const useUser = () => {
  const getUserById = async (userId: string) => {
    return await $fetch<{ success: boolean; data: User }>(
      `/api/user/${userId}`,
      {
        method: "GET",
      },
    );
  };

  const getUserWithPersonById = async (userId: string) => {
    return await $fetch<{
      success: boolean;
      data: UserWithoutPassword;
    }>(`/api/user/${userId}/person`, {
      method: "GET",
    });
  };

  return {
    getUserById,
    getUserWithPersonById,
  };
};
