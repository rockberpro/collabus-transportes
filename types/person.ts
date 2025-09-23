import { ObjectId } from "mongodb";

// Interface para o frontend - Person
export interface Person {
  id?: string;
  name: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

// // Interface para o documento no banco de dados
export interface PersonDocument {
  _id?: ObjectId;
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
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para person com informações do usuário
export interface PersonWithUser {
  id?: string;
  name: string;
  userId: string;
  user?: {
    id?: string;
    email: string;
    password: string;
    type: 'passenger' | 'driver' | 'admin';
    createdAt: Date;
    token: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface PersonWithUserNoPassword {
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
export interface UserWithPerson {
  id?: string;
  email: string;
  password: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  token: string;
  persons?: Person;
}

export interface UserWithPersonNoPassword {
  id?: string;
  email: string;
  type: 'passenger' | 'driver' | 'admin';
  createdAt: Date;
  token: string;
  person?: Person;
}