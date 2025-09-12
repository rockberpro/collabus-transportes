export interface ActivationEmailData {
  name: string;
  activationUrl: string;
}

export function generateActivationEmailTemplate(data: ActivationEmailData) {
  const { name, activationUrl } = data;

  return {
    subject: "Ative sua conta - Collabus Transportes",
    text: `Olá ${name}!

Sua conta foi criada com sucesso no Collabus Transportes.

Para ativar sua conta, acesse o link:
${activationUrl}

Obrigado!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #008080; margin: 0;">Collabus Transportes</h1>
        </div>
        
        <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">
          Bem-vindo ao Collabus Transportes!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Olá <strong>${name}</strong>!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Sua conta foi criada com sucesso no Collabus Transportes.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Para ativar sua conta, clique no botão abaixo:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" 
             style="background-color: #008080; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Ativar Conta
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; margin: 0;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${activationUrl}" style="color: #008080; word-break: break-all;">${activationUrl}</a>
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Este email foi enviado automaticamente. Não responda a este email.<br>
          © ${new Date().getFullYear()} Collabus Transportes. Todos os direitos reservados.
        </p>
      </div>
    `
  };
}
