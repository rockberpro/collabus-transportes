import { User, Person, Role, TokenType } from "@prisma/client";
import { PrismaFactory } from "../factories/prismaFactory";

type UserWithoutPassword = Omit<User, 'password'>;
type UserWithPerson = User & { person: Person | null };
type UserWithPersonNoPassword = Omit<UserWithPerson, 'password'>;

export class UserService {
  private prismaFactory: PrismaFactory;

  constructor() {
    this.prismaFactory = PrismaFactory.getInstance();
  }

  async findUserByActivationToken(token: string): Promise<UserWithoutPassword | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token: token,
        type: 'EMAIL_VERIFICATION',
        usedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!tokenRecord || !tokenRecord.user) {
      return null;
    }

    const { password, ...userWithoutPassword } = tokenRecord.user;
    return userWithoutPassword;
  }

  async findUserByEmail(email: string): Promise<UserWithoutPassword | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findUserById(userId: string): Promise<UserWithoutPassword | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async activateUser(userId: string): Promise<void> {
    const prisma = await this.prismaFactory.getClient();
    
    await prisma.$transaction(async (tx) => {
      // Ativar usuário
      await tx.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      // Marcar token de ativação como usado
      await tx.token.updateMany({
        where: {
          userId: userId,
          type: 'EMAIL_VERIFICATION',
          usedAt: null
        },
        data: { usedAt: new Date() }
      });
    });
  }

  async updateUser(
    userId: string,
    updateData: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<void> {
    const prisma = await this.prismaFactory.getClient();
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  async findUserWithPerson(id: string): Promise<UserWithPersonNoPassword | null> {
    const prisma = await this.prismaFactory.getClient();
    
    const userWithPerson = await prisma.user.findUnique({
      where: { id },
      include: {
        person: true
      }
    });

    if (!userWithPerson) {
      return null;
    }

    const { password, ...userWithoutPassword } = userWithPerson;
    return userWithoutPassword;
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    const prisma = await this.prismaFactory.getClient();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos",
      });
    }

    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Conta não ativada! Verifique seu email para ativar a conta.",
      });
    }

    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos.",
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUserWithPerson(signUpData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: any; activationToken: string }> {
    const prisma = await this.prismaFactory.getClient();
    
    const existingUser = await prisma.user.findUnique({
      where: { email: signUpData.email }
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    const bcrypt = await import("bcryptjs");
    const { randomUUID } = await import("crypto");

    const hashedPassword = await bcrypt.hash(signUpData.password, 12);
    const activationToken = randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      // Criar pessoa primeiro
      const person = await tx.person.create({
        data: {
          firstName: signUpData.name.split(' ')[0] || signUpData.name,
          lastName: signUpData.name.split(' ').slice(1).join(' ') || '',
        }
      });

      // Criar usuário
      const user = await tx.user.create({
        data: {
          email: signUpData.email,
          password: hashedPassword,
          role: 'PASSAGEIRO',
          isActive: false,
          personId: person.id,
        }
      });

      // Criar token de ativação
      await tx.token.create({
        data: {
          token: activationToken,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          userId: user.id,
        }
      });

      return { user, person };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      activationToken,
    };
  }
}
