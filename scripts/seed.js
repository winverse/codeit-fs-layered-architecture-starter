import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

const NUM_USERS_TO_CREATE = 5;

const xs = (n) => Array.from({ length: n }, (_, i) => i + 1);

const makeUserInput = () => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: faker.internet.password(),
});

const resetDb = (prisma) => prisma.user.deleteMany();

const seedUsers = async (prisma, count) => {
  const data = xs(count).map(makeUserInput);

  return await prisma.user.createManyAndReturn({
    data,
    select: { id: true },
  });
};

async function main(prisma) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('⚠️  프로덕션 환경에서는 시딩을 실행하지 않습니다');
  }

  if (!process.env.DATABASE_URL?.includes('localhost')) {
    throw new Error('⚠️  localhost 데이터베이스에만 시딩을 실행할 수 있습니다');
  }

  console.log('🌱 시딩 시작...');

  await resetDb(prisma);
  console.log('✅ 기존 데이터 삭제 완료');

  const users = await seedUsers(prisma, NUM_USERS_TO_CREATE);
  console.log(`✅ ${users.length}명의 유저가 생성되었습니다`);

  console.log('✅ 데이터 시딩 완료');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

main(prisma)
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1); // 프로세스 종료
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
