# Layered Architecture 마이그레이션 Starter

이 프로젝트는 Express와 Prisma로 만든 인증·사용자 API를 계층형 아키텍처로
마이그레이션하기 위한 시작 코드입니다. 처음 실행하면 라우터 안에 HTTP 처리,
비즈니스 규칙, 데이터 접근 코드가 함께 있는 상태를 확인할 수 있습니다.

## 제공된 코드와 학습 범위

- `src/routes/`: 인증·사용자 API와 비즈니스 규칙이 섞여 있는 시작 코드
- `src/repository/`: 함수 객체 형태의 Prisma 데이터 접근 코드
- `src/utils/`: 비밀번호·JWT·쿠키 처리 함수
- `public/`: API 결과를 확인하는 로컬 테스트 화면

강의에서는 같은 폴더에서 코드를 누적 수정합니다. Controller, Service,
Repository, Provider의 책임을 분리하고 Awilix 컨테이너와 `App` 부트스트랩을
연결하는 것이 최종 목표입니다.

## 시작하기

1. `env/.env.example`을 `env/.env.development`로 복사하고 PostgreSQL 연결 정보와
   서로 다른 JWT 비밀키를 입력합니다.
2. 의존성을 설치하고 Prisma Client를 생성합니다.

```bash
pnpm install
pnpm prisma:generate
```

3. 폐기 가능한 로컬 개발 데이터베이스에 스키마를 반영합니다.

```bash
pnpm prisma:push
```

초기 데이터가 필요하면 `pnpm seed`를 실행합니다. 이 명령은 `localhost:5432`의
`prisma_auth` 개발 데이터베이스에서만 동작하며 기존 사용자 데이터를
초기화합니다.

4. 개발 서버를 실행합니다.

```bash
pnpm dev
```

서버가 시작되면 `http://localhost:5001`에서 테스트 화면을 열거나
`http://localhost:5001/api` 아래의 API를 호출할 수 있습니다.
