import crypto from 'crypto';

export function calculateHmacSha256(data: string, key: string): string {
  return crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');
} 