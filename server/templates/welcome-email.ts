export interface WelcomeEmailData {
  name: string;
}

export function generateWelcomeEmailTemplate(data: WelcomeEmailData) {
  const { name } = data;

  return {
    subject: "Bem-vindo ao Collabus Transportes!",
    text: `Olá ${name}!

Bem-vindo ao Collabus Transportes!

Sua conta foi ativada com sucesso e agora você pode aproveitar todos os nossos serviços.

Obrigado por escolher nossos serviços!

Equipe Collabus Transportes`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #008080; margin: 0;">Collabus Transportes</h1>
        </div>
        
        <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">
          Conta Ativada com Sucesso! 🎉
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Olá <strong>${name}</strong>!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Bem-vindo ao Collabus Transportes!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Sua conta foi ativada com sucesso e agora você pode aproveitar todos os nossos serviços.
        </p>
        
        <div style="background-color: #e8f6f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #008080; margin-top: 0;">O que você pode fazer agora:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Acessar seu painel de controle</li>
            <li>Gerenciar seus dados pessoais</li>
            <li>Utilizar nossos serviços de transporte</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Obrigado por escolher nossos serviços!
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Collabus Transportes. Todos os direitos reservados.<br>
          Este email foi enviado automaticamente. Não responda a este email.
        </p>
      </div>
    `
  };
}
