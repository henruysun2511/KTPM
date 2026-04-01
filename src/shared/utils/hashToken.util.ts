import crypto from 'crypto';

import { env } from 'configs/env.config';

export const hashToken = (token: string): string => {
  const secret = env.JWT_REFRESH_TOKEN_SECRET || 'change_me_in_prod';
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
};
