// Interface para o frontend
export interface User {
  id?: string;
  email: string;
  role: "passenger" | "driver" | "admin";
  token: string;
  active: boolean;
}

// Interface para dados de cadastro
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// Interface para dados de login
export interface SignInData {
  email: string;
  password: string;
}

// Interface para o documento
export interface UserDocument {
  id?: string;
  email: string;
  password: string;
  role: "passenger" | "driver" | "admin";
  active: boolean;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocumentNoPassword {
  id?: string;
  email: string;
  role: "passenger" | "driver" | "admin";
  active: boolean;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}
