import { Person, User } from "@prisma/client";
import { PrismaFactory } from "../factories/prismaFactory";

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

  async findAllPersons(): Promise<Person[]> {
    const prisma = await this.prismaFactory.getClient();
    
    return await prisma.person.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
