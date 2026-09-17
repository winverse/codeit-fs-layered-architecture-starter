import postgres from '@prisma/orm-postgres/runtime';
import { config } from '#config';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres({
  contractJson,
  url: config.DATABASE_URL,
});
