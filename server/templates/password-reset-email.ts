export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
}

export function generatePasswordResetEmailTemplate(data: PasswordResetEmailData) {
  const { name, resetUrl } = data;

  return {
    subject: "Recuperação de Senha - Collabus Transportes",
    text: `Olá ${name}!

Recebemos uma solicitação para redefinir a senha da sua conta no Collabus Transportes.

Para redefinir sua senha, acesse o link abaixo:
${resetUrl}

Este link expira em 1 hora por motivos de segurança.

Se você não solicitou esta alteração, ignore este email.

Equipe Collabus Transportes`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #008080; margin: 0;">Collabus Transportes</h1>
        </div>
        
        <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">
          Recuperação de Senha
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Olá <strong>${name}</strong>!
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta no Collabus Transportes.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Para redefinir sua senha, clique no botão abaixo:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #d9534f; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            Redefinir Senha
          </a>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            ⚠️ <strong>Importante:</strong> Este link expira em 1 hora por motivos de segurança.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; margin: 0;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${resetUrl}" style="color: #008080; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
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
