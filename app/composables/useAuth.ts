import type { User, SignUpData, SignInData } from "~~/types/user";

export const useAuth = () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const signUp = async (signUpData: SignUpData) => {
    return await $fetch<{ success: boolean; data: User }>("/api/auth/sign-up", {
      method: "POST",
      body: signUpData,
      credentials: 'include',
    });
  };

  const signIn = async (signInData: SignInData) => {
    return await $fetch<{
      token: { accessToken: string };
      user: User;
    }>("/api/auth/sign-in", {
      method: "POST",
      body: signInData,
      credentials: 'include',
    });
  };

  const signOut = async () => {
    const { clear } = useUserSession();
    await $fetch<Record<string, never>>("/api/auth/sign-out", {
      method: "POST",
      credentials: 'include',
    });

    await clear();
  };

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    signUp,
    signIn,
    signOut,
  };
};
