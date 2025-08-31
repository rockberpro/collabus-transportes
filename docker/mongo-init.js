// Arquivo de inicialização do MongoDB
// Este script é executado quando o container MongoDB é iniciado pela primeira vez

// Criar usuário para a aplicação
db = db.getSiblingDB('collabus');

db.createUser({
  user: 'collabus_user',
  pwd: 'collabus_password',
  roles: [
    {
      role: 'readWrite',
      db: 'collabus'
    }
  ]
});

// Criar algumas coleções iniciais (opcional)
db.createCollection('usuarios');
db.createCollection('rotas');
db.createCollection('veiculos');

print('MongoDB inicializado com sucesso para o projeto Collabus!');
