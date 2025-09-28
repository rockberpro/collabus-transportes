import { defineStore } from "pinia";

interface AuthState {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  tokenType: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: () =>
    ({
      user: null,
      token: null,
      tokenType: null,
      isAuthenticated: false,
    }) as AuthState,
  actions: {
    setUser(session: any) {
      this.user = session.user;
      this.token = session.token;
      this.tokenType = session.tokenType;
      this.isAuthenticated = true;
    },
    clearUser() {
      this.user = null;
      this.token = null;
      this.tokenType = null;
      this.isAuthenticated = false;
    },
  },
});
