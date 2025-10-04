export interface Person {
  id?: string;
  firstName: string;
  lastName: string;
  cpf?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreatePersonData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;