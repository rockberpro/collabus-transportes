import { getHeader, setHeader } from 'h3';

export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin') || '';

  // allowed origins (read from env when possible)
  const allowedOrigins = [
    process.env.NUXT_PUBLIC_SITE_URL ||
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // In development, allow any origin from the local network
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isLocalNetwork = origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/);
  
  if (allowedOrigins.includes(origin) || (isDevelopment && isLocalNetwork)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin);
    setHeader(event, 'Access-Control-Allow-Credentials', 'true');
    setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // handle preflight
  const method = event.node.req.method?.toUpperCase();
  if (method === 'OPTIONS') {
    // End the response for preflight requests
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});
