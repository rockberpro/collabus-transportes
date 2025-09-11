// Interface para o frontend (português)
export interface User {
  id?: string;
  nome: string;
  email: string;
  tipo: 'passageiro' | 'motorista' | 'admin';
  dataCriacao: Date;
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
  _id?: string;
  name: string;
  email: string;
  password: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  active: boolean;
}

// Interface para criar usuário no banco (sem _id)
export interface CreateUserDocument {
  name: string;
  email: string;
  password: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  active: boolean;
}

// Funções utilitárias para mapeamento
export const mapUserDocumentToUser = (doc: UserDocument): User => ({
  id: doc._id?.toString(),
  nome: doc.name,
  email: doc.email,
  tipo: doc.type === 'passenger' ? 'passageiro' : 
        doc.type === 'driver' ? 'motorista' : 'admin',
  dataCriacao: doc.createdAt,
});

export const mapSignUpDataToUserDocument = (
  data: SignUpData, 
  hashedPassword: string
): CreateUserDocument => ({
  name: data.name,
  email: data.email,
  password: hashedPassword,
  type: 'passenger',
  createdAt: new Date(),
  active: false,
});
