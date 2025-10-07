import { defineStore } from "pinia";

interface AuthState {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;
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
    updateUserDetails(details: { name?: string; firstName?: string; lastName?: string; createdAt?: Date }) {
      if (this.user) {
        if (details.name !== undefined) this.user.name = details.name;
        if (details.firstName !== undefined) this.user.firstName = details.firstName;
        if (details.lastName !== undefined) this.user.lastName = details.lastName;
        if (details.createdAt !== undefined) this.user.createdAt = details.createdAt;
      }
    },
    clearUser() {
      this.user = null;
      this.token = null;
      this.tokenType = null;
      this.isAuthenticated = false;
    },
  },
});
