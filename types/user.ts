import { ObjectId } from 'mongodb';

// Interface para o frontend
export interface User {
  id?: string;
  email: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  token: string;
}

// Interface para dados de cadastro (API format)
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// Interface para dados de login (API format)
export interface SignInData {
  email: string;
  password: string;
}

// Interface para o documento no banco de dados (inglês)
export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  active: boolean;
  token: string;
}

// Interface para criar usuário no banco (sem _id)
export interface CreateUserDocument {
  email: string;
  password: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  active: boolean;
  token: string;
}

// Funções utilitárias para mapeamento
export const mapUserDocumentToUser = (doc: UserDocument): User => ({
  id: doc._id?.toString(),
  email: doc.email,
  type: doc.type,
  createdAt: doc.createdAt,
  token: doc.token,
});

export const mapSignUpDataToUserDocument = async (
  data: SignUpData
): Promise<CreateUserDocument> => {
  const bcrypt = await import('bcryptjs');
  const { randomUUID } = await import('crypto');
  
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const activationToken = randomUUID();
  
  return {
    email: data.email,
    password: hashedPassword,
    type: 'passenger',
    createdAt: new Date(),
    active: false,
    token: activationToken,
  };
};
