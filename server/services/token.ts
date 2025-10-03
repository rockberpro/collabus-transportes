import { Token, TokenType } from "@prisma/client";
import { PrismaFactory } from "../factories/prismaFactory";

export class TokenService {
  private prismaFactory: PrismaFactory;

  constructor() {
    this.prismaFactory = PrismaFactory.getInstance();
  }

  async createToken(
    token: string, 
    userId: string, 
    type: TokenType, 
    expiresAt: Date
  ): Promise<void> {
    const prisma = await this.prismaFactory.getClient();

    await prisma.token.create({
      data: {
        token,
        userId,
        type,
        expiresAt,
      }
    });
  }

  async setRefreshToken(token: string, userId: string): Promise<void> {
    const prisma = await this.prismaFactory.getClient();

    await prisma.$transaction(async (tx) => {
      // Marcar tokens de refresh existentes como usados
      await tx.token.updateMany({
        where: {
          userId,
          type: 'REFRESH_TOKEN',
          usedAt: null
        },
        data: {
          usedAt: new Date()
        }
      });

      // Criar novo refresh token
      await tx.token.create({
        data: {
          token,
          userId,
          type: 'REFRESH_TOKEN',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        }
      });
    });
  }

  async revokeUserTokens(userId: string, type?: TokenType): Promise<void> {
    const prisma = await this.prismaFactory.getClient();

    const where: any = {
      userId,
      usedAt: null
    };

    if (type) {
      where.type = type;
    }

    await prisma.token.updateMany({
      where,
      data: {
        usedAt: new Date()
      }
    });
  }

  async isTokenValid(token: string): Promise<boolean> {
    const prisma = await this.prismaFactory.getClient();

    const tokenRecord = await prisma.token.findUnique({
      where: { token }
    });

    if (!tokenRecord) {
      return false;
    }

    // Verificar se o token não foi usado e não expirou
    return !tokenRecord.usedAt && tokenRecord.expiresAt > new Date();
  }

  async findTokenByValue(token: string): Promise<Token | null> {
    const prisma = await this.prismaFactory.getClient();

    return await prisma.token.findUnique({
      where: { token }
    });
  }

  async markTokenAsUsed(token: string): Promise<void> {
    const prisma = await this.prismaFactory.getClient();

    await prisma.token.update({
      where: { token },
      data: {
        usedAt: new Date()
      }
    });
  }

  async getUserTokens(userId: string, type?: TokenType): Promise<Token[]> {
    const prisma = await this.prismaFactory.getClient();

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return await prisma.token.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async cleanExpiredTokens(): Promise<number> {
    const prisma = await this.prismaFactory.getClient();

    const result = await prisma.token.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }
}
