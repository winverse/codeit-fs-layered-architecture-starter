import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5001';
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

assert.ok(accessSecret, 'JWT_ACCESS_SECRET 환경 변수가 필요합니다.');
assert.ok(refreshSecret, 'JWT_REFRESH_SECRET 환경 변수가 필요합니다.');

const runId = Date.now();
const firstInput = {
  email: `layered-${runId}-first@example.com`,
  password: 'A'.repeat(72),
  name: 'Layered First',
};
const secondInput = {
  email: `layered-${runId}-second@example.com`,
  password: 'Password123!',
  name: 'Layered Second',
};
const thirdInput = {
  email: `layered-${runId}-third@example.com`,
  password: 'Password123!',
  name: 'Layered Third',
};

const createdUserIds = new Set();

const request = async (path, { cookies, body, ...options } = {}) => {
  const headers = new globalThis.Headers(options.headers);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (cookies) headers.set('Cookie', cookies);

  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const parsedBody =
    text && contentType.includes('application/json') ? JSON.parse(text) : text;
  const setCookies = response.headers.getSetCookie();
  const responseCookies = setCookies
    .map((cookie) => cookie.split(';', 1)[0])
    .join('; ');

  return {
    response,
    body: parsedBody,
    cookies: responseCookies,
    setCookies,
  };
};

const expectStatus = (result, status, label) => {
  assert.equal(result.response.status, status, label);
};

const hasSetCookie = (result, name) =>
  result.setCookies.some((cookie) => cookie.startsWith(`${name}=`));

const hasClearedCookie = (result, name) =>
  result.setCookies.some((cookie) => cookie.startsWith(`${name}=;`));

const getCookiePair = (cookies, name) => {
  const pair = cookies
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`));
  assert.ok(pair, `${name} 쿠키가 필요합니다.`);
  return pair;
};

const signUp = async (input) => {
  const result = await request('/api/auth/signup', {
    method: 'POST',
    body: input,
  });
  expectStatus(result, 201, '회원가입은 201을 반환해야 합니다.');
  assert.ok(
    Number.isInteger(result.body.id),
    '회원가입 응답에 사용자 ID가 필요합니다.',
  );
  createdUserIds.add(result.body.id);
  assert.ok(hasSetCookie(result, 'accessToken'));
  assert.ok(hasSetCookie(result, 'refreshToken'));
  assert.equal(result.body.password, undefined);
  return result;
};

const cleanupUsers = async () => {
  const errors = [];

  for (const id of createdUserIds) {
    try {
      const accessToken = jwt.sign({ userId: id }, accessSecret, {
        expiresIn: '1m',
      });
      const result = await request(`/api/users/${id}`, {
        method: 'DELETE',
        cookies: `accessToken=${accessToken}`,
      });
      if (![204, 404].includes(result.response.status)) {
        errors.push(
          new Error(`검증 사용자 ${id} 정리 실패: ${result.response.status}`),
        );
      }
    } catch (error) {
      errors.push(error);
    }
  }

  return errors;
};

const run = async () => {
  const first = await signUp(firstInput);
  const second = await signUp(secondInput);

  expectStatus(
    await request('/api/auth/signup', { method: 'POST', body: firstInput }),
    409,
    '중복 이메일 회원가입은 409를 반환해야 합니다.',
  );

  const correctLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: firstInput.email, password: firstInput.password },
  });
  expectStatus(
    correctLogin,
    200,
    '올바른 비밀번호 로그인은 200을 반환해야 합니다.',
  );
  assert.ok(hasSetCookie(correctLogin, 'accessToken'));
  assert.ok(hasSetCookie(correctLogin, 'refreshToken'));
  assert.equal(correctLogin.body.password, undefined);

  expectStatus(
    await request('/api/auth/login', {
      method: 'POST',
      body: { email: firstInput.email, password: `${firstInput.password}B` },
    }),
    400,
    'UTF-8 기준 72바이트를 초과한 로그인 비밀번호는 400을 반환해야 합니다.',
  );
  expectStatus(
    await request('/api/auth/login', {
      method: 'POST',
      body: { email: firstInput.email, password: 'wrong-password' },
    }),
    401,
    '잘못된 비밀번호 로그인은 401을 반환해야 합니다.',
  );

  const me = await request('/api/auth/me', { cookies: first.cookies });
  expectStatus(me, 200, '인증된 내 정보 조회는 200을 반환해야 합니다.');
  assert.equal(me.body.email, firstInput.email);

  const refreshCookie = getCookiePair(first.cookies, 'refreshToken');
  const refreshWithoutAccess = await request('/api/auth/me', {
    cookies: refreshCookie,
  });
  expectStatus(
    refreshWithoutAccess,
    200,
    'Access Token 없이 유효한 Refresh Token만 있으면 인증을 복구해야 합니다.',
  );
  assert.ok(hasSetCookie(refreshWithoutAccess, 'accessToken'));
  assert.ok(hasSetCookie(refreshWithoutAccess, 'refreshToken'));

  const expiredAccessToken = jwt.sign({ userId: first.body.id }, accessSecret, {
    expiresIn: -1,
  });
  const refreshFromExpiredAccess = await request('/api/auth/me', {
    cookies: `accessToken=${expiredAccessToken}; ${refreshCookie}`,
  });
  expectStatus(
    refreshFromExpiredAccess,
    200,
    '만료된 Access Token과 유효한 Refresh Token이면 인증을 복구해야 합니다.',
  );
  assert.ok(hasSetCookie(refreshFromExpiredAccess, 'accessToken'));

  const nearExpiryAccessToken = jwt.sign(
    { userId: first.body.id },
    accessSecret,
    { expiresIn: '4m' },
  );
  const proactiveRefresh = await request('/api/auth/me', {
    cookies: `accessToken=${nearExpiryAccessToken}; ${refreshCookie}`,
  });
  expectStatus(
    proactiveRefresh,
    200,
    '만료까지 5분 미만인 Access Token은 유효한 Refresh Token으로 갱신해야 합니다.',
  );
  assert.ok(hasSetCookie(proactiveRefresh, 'accessToken'));

  const validAccessWithInvalidRefresh = await request('/api/auth/me', {
    cookies: `accessToken=${nearExpiryAccessToken}; refreshToken=invalid`,
  });
  expectStatus(
    validAccessWithInvalidRefresh,
    200,
    '유효한 Access Token이 있으면 Refresh Token 갱신 실패가 현재 인증을 무효화하지 않아야 합니다.',
  );
  assert.equal(validAccessWithInvalidRefresh.setCookies.length, 0);

  const expiredRefreshToken = jwt.sign(
    { userId: first.body.id },
    refreshSecret,
    { expiresIn: -1 },
  );
  const expiredRefresh = await request('/api/auth/me', {
    cookies: `refreshToken=${expiredRefreshToken}`,
  });
  expectStatus(
    expiredRefresh,
    401,
    '만료된 Refresh Token은 인증에 실패해야 합니다.',
  );
  assert.ok(hasClearedCookie(expiredRefresh, 'accessToken'));
  assert.ok(hasClearedCookie(expiredRefresh, 'refreshToken'));

  const tamperedTokens = await request('/api/auth/me', {
    cookies: 'accessToken=invalid; refreshToken=invalid',
  });
  expectStatus(tamperedTokens, 401, '위조 토큰 요청은 401을 반환해야 합니다.');
  assert.ok(hasClearedCookie(tamperedTokens, 'accessToken'));
  assert.ok(hasClearedCookie(tamperedTokens, 'refreshToken'));

  const users = await request('/api/users');
  expectStatus(users, 200, '사용자 목록 조회는 200을 반환해야 합니다.');
  assert.ok(users.body.some((user) => user.id === first.body.id));
  assert.ok(users.body.every((user) => user.password === undefined));

  const firstDetail = await request(`/api/users/${first.body.id}`);
  expectStatus(firstDetail, 200, '사용자 상세 조회는 200을 반환해야 합니다.');
  assert.equal(firstDetail.body.email, firstInput.email);
  assert.equal(firstDetail.body.password, undefined);

  const third = await request('/api/users', {
    method: 'POST',
    body: thirdInput,
  });
  expectStatus(third, 201, '사용자 생성은 201을 반환해야 합니다.');
  assert.ok(
    Number.isInteger(third.body.id),
    '사용자 생성 응답에 ID가 필요합니다.',
  );
  createdUserIds.add(third.body.id);
  assert.equal(third.body.password, undefined);

  const thirdDetail = await request(`/api/users/${third.body.id}`);
  expectStatus(
    thirdDetail,
    200,
    '생성한 사용자 상세 조회는 200을 반환해야 합니다.',
  );
  assert.equal(thirdDetail.body.email, thirdInput.email);

  const thirdLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: thirdInput.email, password: thirdInput.password },
  });
  expectStatus(
    thirdLogin,
    200,
    '사용자 API로 만든 계정도 로그인할 수 있어야 합니다.',
  );

  const firstUpdate = await request(`/api/users/${first.body.id}`, {
    method: 'PATCH',
    cookies: first.cookies,
    body: { name: 'Layered Updated' },
  });
  expectStatus(firstUpdate, 200, '본인 프로필 수정은 200을 반환해야 합니다.');
  assert.equal(firstUpdate.body.password, undefined);

  expectStatus(
    await request(`/api/users/${second.body.id}`, {
      method: 'PATCH',
      cookies: first.cookies,
      body: { name: 'Forbidden Update' },
    }),
    403,
    '다른 사용자 프로필 수정은 403을 반환해야 합니다.',
  );

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    cookies: first.cookies,
  });
  expectStatus(logout, 204, '로그아웃은 204를 반환해야 합니다.');
  assert.ok(hasClearedCookie(logout, 'accessToken'));
  assert.ok(hasClearedCookie(logout, 'refreshToken'));

  expectStatus(
    await request('/api/auth/me'),
    401,
    '비인증 내 정보 조회는 401을 반환해야 합니다.',
  );

  const ping = await request('/api/ping');
  expectStatus(ping, 200, 'ping은 200을 반환해야 합니다.');
  assert.ok(
    !Number.isNaN(Date.parse(ping.body.message.replace('현재 시간:', ''))),
  );

  for (const [id, cookies, label] of [
    [first.body.id, first.cookies, '첫 번째'],
    [second.body.id, second.cookies, '두 번째'],
    [third.body.id, thirdLogin.cookies, '세 번째'],
  ]) {
    expectStatus(
      await request(`/api/users/${id}`, { method: 'DELETE', cookies }),
      204,
      `${label} 검증 계정 삭제는 204를 반환해야 합니다.`,
    );
    createdUserIds.delete(id);
  }
};

let primaryError;
try {
  await run();
} catch (error) {
  primaryError = error;
}

const cleanupErrors = await cleanupUsers();
if (primaryError) throw primaryError;
if (cleanupErrors.length > 0) {
  throw new AggregateError(cleanupErrors, '검증 사용자 정리에 실패했습니다.');
}

console.log('Layered Architecture API 검증을 통과했습니다.');
