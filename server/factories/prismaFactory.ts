import { PrismaClient } from "@prisma/client";

export class PrismaFactory {
  private static instance: PrismaFactory;
  private client: PrismaClient | null = null;
  private clientPromise: Promise<PrismaClient> | null = null;

  private constructor() {}

  public static getInstance(): PrismaFactory {
    if (!PrismaFactory.instance) {
      PrismaFactory.instance = new PrismaFactory();
    }
    return PrismaFactory.instance;
  }

  public async getClient(): Promise<PrismaClient> {
    if (!this.clientPromise) {
      this.clientPromise = this.createConnection();
    }
    return this.clientPromise;
  }

  private async createConnection(): Promise<PrismaClient> {
    if (!this.client) {
      this.client = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
        errorFormat: "pretty",
      });

      await this.client.$connect();

      await this.client.$queryRaw`SELECT 1`;

      console.log("Prisma conectado com sucesso ao PostgreSQL");
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.$disconnect();
        console.log("Prisma desconectado com sucesso");
      } catch (error) {
        console.error("Erro ao desconectar Prisma:", error);
      } finally {
        this.client = null;
        this.clientPromise = null;
      }
    }
  }

  public isConnected(): boolean {
    return this.client !== null;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Health check falhou:", error);
      return false;
    }
  }
}

export default PrismaFactory.getInstance();
