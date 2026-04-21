import type { Request } from 'express';

export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0];
    return firstIp?.trim() ?? forwarded.trim();
  }
  console.log('clientIp from socket', req.socket.remoteAddress);
  return req.socket.remoteAddress || 'unknown';
};
