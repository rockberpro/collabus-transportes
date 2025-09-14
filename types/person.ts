import { ObjectId } from "mongodb";

// Interface para o frontend - Person
export interface Person {
  id?: string;
  name: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para o documento no banco de dados
export interface PersonDocument {
  _id?: string;
  name: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para criar person no banco (sem _id)
export interface CreatePersonDocument {
  name: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para dados de criação de person (API format)
export interface CreatePersonData {
  name: string;
  userId: ObjectId;
}

// Funções utilitárias para mapeamento
export const mapPersonDocumentToPerson = (doc: PersonDocument): Person => ({
  id: doc._id?.toString(),
  name: doc.name,
  userId: doc.userId,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const mapCreatePersonDataToPersonDocument = (
  data: CreatePersonData
): CreatePersonDocument => {
  return {
    name: data.name,
    userId: data.userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Interface para person com informações do usuário
export interface PersonWithUser {
  id?: string;
  name: string;
  userId: string;
  user?: {
    id?: string;
    email: string;
    type: 'passenger' | 'driver' | 'admin';
    createdAt: Date;
    token: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para usuário com suas pessoas associadas
export interface UserWithPersons {
  id?: string;
  email: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  token: string;
  persons?: Person[];
}
