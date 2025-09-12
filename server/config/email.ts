export const emailConfig = {
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  from: {
    name: "Collabus Transportes",
    address: process.env.GMAIL_USER || ""
  },
  baseUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"
};

export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.GMAIL_USER) {
    errors.push("GMAIL_USER não configurado");
  }

  if (!process.env.GMAIL_PASS) {
    errors.push("GMAIL_PASS não configurado");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
