export interface BaseEmailTemplateOptions {
  title: string;
  content: string;
  primaryButton?: {
    text: string;
    url: string;
    color?: string;
  };
  secondaryInfo?: string;
  warning?: string;
}

export function generateBaseEmailTemplate(options: BaseEmailTemplateOptions) {
  const { title, content, primaryButton, secondaryInfo, warning } = options;
  const currentYear = new Date().getFullYear();
  const buttonColor = primaryButton?.color || "#008080";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #008080; margin: 0;">Collabus Transportes</h1>
      </div>
      
      <!-- Title -->
      <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">
        ${title}
      </h2>
      
      <!-- Content -->
      <div style="font-size: 16px; line-height: 1.6; color: #333;">
        ${content}
      </div>
      
      <!-- Primary Button -->
      ${primaryButton ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${primaryButton.url}" 
             style="background-color: ${buttonColor}; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            ${primaryButton.text}
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; margin: 0;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${primaryButton.url}" style="color: #008080; word-break: break-all;">${primaryButton.url}</a>
          </p>
        </div>
      ` : ''}
      
      <!-- Warning -->
      ${warning ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            ⚠️ <strong>Importante:</strong> ${warning}
          </p>
        </div>
      ` : ''}
      
      <!-- Secondary Info -->
      ${secondaryInfo ? `
        <p style="font-size: 14px; line-height: 1.6; color: #666;">
          ${secondaryInfo}
        </p>
      ` : ''}
      
      <!-- Footer -->
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${currentYear} Collabus Transportes. Todos os direitos reservados.<br>
        Este email foi enviado automaticamente. Não responda a este email.
      </p>
    </div>
  `;
}
