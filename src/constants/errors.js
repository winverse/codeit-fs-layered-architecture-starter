// Prisma 에러 코드 상수
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};

// 에러 메시지 상수
export const ERROR_MESSAGE = {
  // User 관련
  USER_NOT_FOUND: 'User not found',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  FAILED_TO_FETCH_USERS: 'Failed to fetch users',
  FAILED_TO_FETCH_USER: 'Failed to fetch user',
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_UPDATE_USER: 'Failed to update user',
  FAILED_TO_DELETE_USER: 'Failed to delete user',

  // Auth 관련
  NO_AUTH_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND_FROM_TOKEN: 'User not found from token',
  AUTH_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid email or password',

  // Validation
  INVALID_INPUT: 'Invalid input',
  VALIDATION_FAILED: 'Validation failed',

  // 일반 에러 (Exception 기본값으로 사용)
  RESOURCE_NOT_FOUND: '리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  RESOURCE_CONFLICT: '이미 존재하는 데이터입니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
};
