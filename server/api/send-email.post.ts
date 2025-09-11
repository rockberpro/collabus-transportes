import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error("❌ Gmail credentials not configured");
      throw createError({
        statusCode: 500,
        statusMessage: "Email configuration missing"
      });
    }

    console.log("📧 Attempting to send email to:", body.to);
    console.log("📧 Using Gmail user:", process.env.GMAIL_USER);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // TLS port
      secure: false, // true for 465 false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const mailOptions = {
      from: `"Collabus Transportes" <${process.env.GMAIL_USER}>`,
      to: body.to,
      subject: body.subject,
      text: body.text,
      html: body.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);

    return { 
      success: true, 
      messageId: info.messageId
    };

  } catch (error: any) {
    console.error("❌ Email send failed:", error);
    
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email",
      data: {
        error: error.message,
        code: error.code
      }
    });
  }
});
