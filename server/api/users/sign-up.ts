import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

interface SignUpBody {
  fullName: string
  email: string
  password: string
  passwordAgain: string
}

// Type guard para verificar se o erro tem statusCode
function isErrorWithStatusCode(error: unknown): error is Error & { statusCode: number } {
  return error instanceof Error && 'statusCode' in error && typeof (error as any).statusCode === 'number'
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<SignUpBody>(event)
    
    // Validação básica
    if (!body.fullName || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nome, email e senha são obrigatórios'
      })
    }

    // Validar se as senhas coincidem
    if (body.password !== body.passwordAgain) {
      throw createError({
        statusCode: 400,
        statusMessage: 'As senhas não coincidem'
      })
    }

    // Conectar ao MongoDB usando variáveis de ambiente
    const mongoUri = process.env.MONGODB_URI || ''
    const dbName = process.env.MONGODB_DB_NAME || ''
    const authSource = process.env.MONGODB_AUTH_SOURCE || ''
    
    const client = new MongoClient(mongoUri, {
      authSource
    })
    
    await client.connect()
    const db = client.db(dbName)
    const usuarios = db.collection('usuarios')

    // Verificar se o usuário já existe
    const existingUser = await usuarios.findOne({ email: body.email })
    if (existingUser) {
      await client.close()
      throw createError({
        statusCode: 409,
        statusMessage: 'Usuário já existe com este email'
      })
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Criar o usuário
    const newUser = {
      nome: body.fullName,
      email: body.email,
      senha: hashedPassword,
      tipo: 'passageiro', // padrão
      dataCriacao: new Date(),
      ativo: true
    }

    const result = await usuarios.insertOne(newUser)
    await client.close()

    // Retornar sucesso (sem a senha)
    return {
      success: true,
      user: {
        id: result.insertedId,
        nome: newUser.nome,
        email: newUser.email,
        tipo: newUser.tipo,
        dataCriacao: newUser.dataCriacao
      }
    }

  } catch (error: unknown) {
    console.error('Erro ao cadastrar usuário:', error)
    
    if (isErrorWithStatusCode(error)) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    })
  }
})
