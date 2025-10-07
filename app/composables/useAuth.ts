import type { User, SignUpData, SignInData, SignInResponse } from "../../types/user";

export const useAuth = () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await $fetch<{ success: boolean; data: User }>(
        "/api/auth/sign-up",
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
      const response = await $fetch<{ token: { accessToken: string }; user: User }>(
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

  const signOut = async () => {
    const { clear } = useUserSession();
    try {
      await $fetch<{}>("/api/auth/sign-out", {
        method: "POST",
      });

      clear();
    } catch (error) {
      throw error;
    }
  };

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    signUp,
    signIn,
    signOut
  };
};
