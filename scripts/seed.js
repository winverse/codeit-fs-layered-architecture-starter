import postgres from '@prisma/orm-postgres/runtime';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { pathToFileURL, URL } from 'node:url';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };

const NUM_USERS_TO_CREATE = 5;
const BCRYPT_SALT_ROUNDS = 10;

const xs = (n) => Array.from({ length: n }, (_, i) => i + 1);

const makeUserInput = async () => {
  const password = faker.string.alphanumeric(16);

  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
  };
};

const resetDb = (db) => db.orm.public.User.deleteAll();

export const seedUsers = async (db, count) => {
  const data = await Promise.all(xs(count).map(makeUserInput));

  return await db.orm.public.User.select('id').createAll(data);
};

const getDevelopmentDatabaseUrl = () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('⚠️  프로덕션 환경에서는 시딩을 실행하지 않습니다');
  }

  let databaseUrl;
  try {
    databaseUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('⚠️  올바른 DATABASE_URL이 필요합니다');
  }

  const protocolIsPostgreSql = ['postgres:', 'postgresql:'].includes(
    databaseUrl.protocol,
  );
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

  if (
    !protocolIsPostgreSql ||
    databaseUrl.hostname !== 'localhost' ||
    databaseUrl.port !== '5432' ||
    databaseName !== 'prisma_auth' ||
    databaseUrl.search !== '' ||
    databaseUrl.hash !== ''
  ) {
    throw new Error(
      '⚠️  localhost:5432의 prisma_auth 데이터베이스에만 시딩을 실행할 수 있습니다',
    );
  }

  return databaseUrl.toString();
};

async function seed(db) {
  console.log('🌱 시딩 시작...');

  await resetDb(db);
  console.log('✅ 기존 데이터 삭제 완료');

  const users = await seedUsers(db, NUM_USERS_TO_CREATE);
  console.log(`✅ ${users.length}명의 유저가 생성되었습니다`);

  console.log('✅ 데이터 시딩 완료');
}

const run = async () => {
  const db = postgres({
    contractJson,
    url: getDevelopmentDatabaseUrl(),
  });

  try {
    await seed(db);
  } catch (error) {
    console.error('❌ 시딩 에러:', error);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await run();
}
