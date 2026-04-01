import { PayOS } from '@payos/node';

import { env } from './env.config';

export const payos = new PayOS({
  clientId: env.PAYOS_CLIENT_ID,
  apiKey: env.PAYOS_API_KEY,
  checksumKey: env.PAYOS_CHECKSUM_KEY,
  partnerCode: env.PAYOS_PARTNER_CODE
});
