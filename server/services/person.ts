import { Person, User } from "@prisma/client";
import { PrismaFactory } from "../factories/prismaFactory";

type PersonWithUserNoPassword = Person & { 
  user: Omit<User, 'password'> | null;
};

export class PersonService {
  private prismaFactory: PrismaFactory;

  constructor() {
    this.prismaFactory = PrismaFactory.getInstance();
  }

  async findPersonById(personId: string): Promise<Person | null> {
    const prisma = await this.prismaFactory.getClient();
    
    return await prisma.person.findUnique({
      where: { id: personId }
    });
  }

  async findPersonByUserId(userId: string): Promise<Person | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        person: true
      }
    });
    
    return user?.person || null;
  }

  async createPerson(personData: {
    firstName: string;
    lastName: string;
    cpf?: string;
    phone?: string;
    address?: string;
    birthDate?: Date;
  }): Promise<string> {
    const prisma = await this.prismaFactory.getClient();
    
    const person = await prisma.person.create({
      data: personData
    });
    
    return person.id;
  }

  async updatePerson(
    personId: string,
    updateData: Partial<Omit<Person, 'id' | 'createdAt'>>
  ): Promise<void> {
    const prisma = await this.prismaFactory.getClient();
    
    await prisma.person.update({
      where: { id: personId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      }
    });
  }

  async deletePerson(personId: string): Promise<void> {
    const prisma = await this.prismaFactory.getClient();
    
    await prisma.person.delete({
      where: { id: personId }
    });
  }

  async findPersonWithUser(personId: string): Promise<PersonWithUserNoPassword | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const personWithUser = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        user: true
      }
    });

    if (!personWithUser) {
      return null;
    }

    if (!personWithUser.user) {
      return { ...personWithUser, user: null };
    }

    const { password, ...userWithoutPassword } = personWithUser.user;
    
    return {
      ...personWithUser,
      user: userWithoutPassword
    };
  }

  async findAllPersons(): Promise<Person[]> {
    const prisma = await this.prismaFactory.getClient();
    
    return await prisma.person.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findPersonsWithUsers(): Promise<PersonWithUserNoPassword[]> {
    const prisma = await this.prismaFactory.getClient();
    
    const personsWithUsers = await prisma.person.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return personsWithUsers.map(person => {
      if (!person.user) {
        return { ...person, user: null };
      }

      const { password, ...userWithoutPassword } = person.user;
      return {
        ...person,
        user: userWithoutPassword
      };
    });
  }
}
