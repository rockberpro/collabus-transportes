export interface ActivationSuccessPageData {
  name: string;
  loginUrl?: string;
}

export function generateActivationSuccessPage(data: ActivationSuccessPageData) {
  const { name, loginUrl = '/sign-in' } = data;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conta Ativada com Sucesso - Collabus Transportes</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          color: #008080;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .success-icon {
          font-size: 80px;
          margin: 20px 0;
        }
        h1 {
          color: #008080;
          font-size: 28px;
          margin: 20px 0;
        }
        .message {
          color: #333;
          font-size: 18px;
          line-height: 1.6;
          margin: 20px 0;
        }
        .highlight {
          color: #008080;
          font-weight: bold;
        }
        .info-box {
          background-color: #e8f6f6;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          border-left: 4px solid #008080;
        }
        .info-box h3 {
          color: #008080;
          margin-top: 0;
          font-size: 20px;
        }
        .info-box ul {
          text-align: left;
          color: #555;
          line-height: 1.8;
        }
        .btn {
          display: inline-block;
          background-color: #008080;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          font-size: 18px;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #006666;
        }
        .footer {
          margin-top: 40px;
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
          .message {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🚌 Collabus Transportes</div>
        
        <div class="success-icon">✅</div>
        
        <h1>Conta Ativada com Sucesso!</h1>
        
        <p class="message">
          Olá <span class="highlight">${name}</span>!
        </p>
        
        <p class="message">
          Parabéns! Sua conta foi ativada com sucesso e agora você tem acesso completo à plataforma Collabus Transportes.
        </p>
        
        <div class="info-box">
          <h3>🎉 O que você pode fazer agora:</h3>
          <ul>
            <li>Acessar seu painel de controle personalizado</li>
            <li>Gerenciar seus dados pessoais</li>
            <li>Utilizar nossos serviços de transporte</li>
            <li>Acompanhar rotas e horários</li>
          </ul>
        </div>
        
        <a href="${loginUrl}" class="btn">Fazer Login Agora</a>
        
        <p class="message" style="font-size: 16px; margin-top: 30px;">
          Obrigado por escolher o Collabus Transportes! 🚀
        </p>
        
        <div class="footer">
          © ${new Date().getFullYear()} Collabus Transportes. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
}
