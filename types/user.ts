import type { Person } from "./person";
import { $Enums } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  password?: string;
  role: $Enums.Role;
  isActive: boolean;
  personId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: {
    accessToken: string;
  },
  user: {
    id: string;
    email: string;
    role: string;
  }
}

export type UserWithoutPassword = Omit<User, "password">;
export type UserWithPerson = UserWithoutPassword & { person: Person | null };
