export interface GoodbyeEmailData {
  name: string;
}

export function generateGoodbyeEmailTemplate(data: GoodbyeEmailData) {
  const { name } = data;

  return {
    subject: "Estamos tristes por ver você partir 😢 - Collabus Transportes",
    text: `Olá ${name},

Estamos tristes por ver você partir 😢

Sua conta no Collabus Transportes foi excluída com sucesso conforme solicitado.

Todos os seus dados foram removidos do nosso sistema.

Esperamos que você volte em breve!

Até logo!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #008080; margin: 0;">Collabus Transportes</h1>
        </div>
        
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; text-align: center;">
          Estamos tristes por ver você partir 😢
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Olá <strong>${name}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Sua conta no Collabus Transportes foi excluída com sucesso conforme solicitado.
        </p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 14px; color: #991b1b; margin: 0;">
            <strong>⚠️ Importante:</strong> Todos os seus dados foram removidos permanentemente do nosso sistema.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Esperamos que você volte em breve! Nossa porta está sempre aberta. 🚌
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Até logo!
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Este email foi enviado automaticamente. Não responda a este email.<br>
          © ${new Date().getFullYear()} Collabus Transportes. Todos os direitos reservados.
        </p>
      </div>
    `
  };
}
