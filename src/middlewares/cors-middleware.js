import { corsOrigins, isProduction } from '#config';

export const cors = (req, res, next) => {
  // 응답 헤더가 요청의 Origin에 따라 달라진다는 것을 캐시에 알립니다
  res.vary('Origin');

  const origin = req.headers.origin;
  const isAllowed = origin && (!isProduction || corsOrigins.includes(origin));

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // 공통 헤더 설정
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight(사전 요청) 처리
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
