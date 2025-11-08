import { PersonService } from "~~/server/services/person";
import { EmailService } from "../../services/email";
import { UserService } from "../../services/user";
import { generateActivationSuccessPage } from "~~/server/templates/activation-success-page";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const token = query.token as string;

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Token de ativação é obrigatório",
      });
    }

    const userService = new UserService();
    const personService = new PersonService();
    
    const user = await userService.findUserByActivationToken(token);
    console.log("Dados do usuario: ", user);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Token inválido, expirado ou conta já ativada",
      });
    }

    const person = await personService.findPersonByUserId(user.id);
    if (!person) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pessoa associada ao usuário não encontrada",
      });
    }

    await userService.activateUser(user.id);
    
    try {
      const emailService = new EmailService();
      const fullName = `${person.firstName} ${person.lastName}`.trim();
      await emailService.sendWelcomeEmail(user.email, fullName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Retornar página HTML em vez de JSON
    const fullName = `${person.firstName} ${person.lastName}`.trim();
    const htmlPage = generateActivationSuccessPage({ 
      name: fullName,
      loginUrl: '/sign-in' 
    });

    // Configurar headers para HTML
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
    
    return htmlPage;
  } catch (error: any) {
    const errorMessage = error.statusMessage || "Erro ao ativar conta";
    const errorPage = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - Collabus Transportes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 600px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
            text-align: center;
          }
          .logo {
            color: #dc2626;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
          }
          .error-icon { 
            font-size: 80px; 
            margin: 20px 0; 
          }
          h1 { 
            color: #dc2626; 
            margin: 20px 0;
            font-size: 28px;
          }
          .message { 
            color: #555; 
            font-size: 18px; 
            line-height: 1.6;
            margin: 20px 0;
          }
          .btn {
            display: inline-block;
            background-color: #008080;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
            transition: background-color 0.3s;
          }
          .btn:hover {
            background-color: #006666;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
          @media (max-width: 640px) {
            .container {
              padding: 30px 20px;
            }
            .logo {
              font-size: 24px;
            }
            h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🚌 Collabus Transportes</div>
          <div class="error-icon">❌</div>
          <h1>Erro na Ativação</h1>
          <p class="message">${errorMessage}</p>
          <a href="/sign-in" class="btn">Voltar para Login</a>
          <div class="footer">
            © ${new Date().getFullYear()} Collabus Transportes. Todos os direitos reservados.
          </div>
        </div>
      </body>
      </html>
    `;
    
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
    setResponseStatus(event, error.statusCode || 500);
    
    return errorPage;
  }
});
