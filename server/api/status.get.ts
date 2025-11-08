import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running smoothly',
  };
});