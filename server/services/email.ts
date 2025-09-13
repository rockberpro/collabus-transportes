import nodemailer from "nodemailer";
import { emailConfig, validateEmailConfig } from "../config/email";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const validation = validateEmailConfig();
    if (!validation.isValid) {
      throw new Error(
        `Email configuration invalid: ${validation.errors.join(", ")}`
      );
    }

    this.transporter = nodemailer.createTransport(emailConfig.smtp);
  }

  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
    } catch (error) {
      throw error;
    }
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId: string }> {
    try {
      await this.verifyConnection();

      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to send email",
        data: {
          error: error.message,
          code: error.code,
        },
      });
    }
  }

  async sendActivationEmail(
    to: string,
    name: string,
    activationToken: string
  ): Promise<{ success: boolean; messageId: string }> {
    const activationUrl = `${emailConfig.baseUrl}/api/users/activate?token=${activationToken}`;

    const { generateActivationEmailTemplate } = await import(
      "../templates/activation-email"
    );
    const emailTemplate = generateActivationEmailTemplate({
      name,
      activationUrl,
    });

    return this.sendEmail({
      to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  async sendWelcomeEmail(
    to: string,
    name: string
  ): Promise<{ success: boolean; messageId: string }> {
    const { generateWelcomeEmailTemplate } = await import(
      "../templates/welcome-email"
    );
    const emailTemplate = generateWelcomeEmailTemplate({ name });

    return this.sendEmail({
      to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string
  ): Promise<{ success: boolean; messageId: string }> {
    const resetUrl = `${emailConfig.baseUrl}/reset-password?token=${resetToken}`;

    const { generatePasswordResetEmailTemplate } = await import(
      "../templates/password-reset-email"
    );
    const emailTemplate = generatePasswordResetEmailTemplate({
      name,
      resetUrl,
    });

    return this.sendEmail({
      to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }
}
