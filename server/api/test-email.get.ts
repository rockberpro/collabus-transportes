import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return { success: false, message: "Gmail credentials not configured" };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify();
    
    return { 
      success: true, 
      message: "SMTP connection successful",
      user: process.env.GMAIL_USER 
    };
    
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message,
      code: error.code 
    };
  }
});
