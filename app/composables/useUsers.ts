import type { User, SignUpData, SignInData } from '../../types/user'

export const useUsers = () => {
  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await $fetch<{ success: boolean; user: User }>(
        "/api/user/sign-up",
        {
          method: "POST",
          body: signUpData,
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (signInData: SignInData) => {
    try {
      const response = await $fetch<{ success: boolean; user: User }>(
        "/api/auth/sign-in",
        {
          method: "POST",
          body: signInData,
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  const findUserWithPerson = async (userId: string): Promise<User | null> => {
    try {
      const response = await $fetch<{ user: User }>(
        `/api/user/${userId}/person`,
        {
          method: "GET",
        }
      );

      return response.user || null;
    } catch (error) {
      throw error;
    }
  };

  return {
    signUp,
    signIn,
    findUserWithPerson
  };
};
