# 계층형 아키텍처 학습용 스타터 프로젝트 (Layered Architecture Starter)

이 프로젝트는 Express.js와 Prisma ORM을 기반으로 작성된 Node.js 백엔드 애플리케이션의 초기 형태(Starter)입니다. 사용자 인증(회원가입, 로그인, 로그아웃) 및 사용자 정보 조회 기능이 구현되어 있습니다.

본 스타터 코드는 아직 비즈니스 로직(Service)과 요청/응답 처리 로직(Controller)이 명확히 분리되지 않고 라우터(Routes) 계층에 혼재되어 있는 구조를 가지고 있습니다. 일부 데이터 접근 로직(Repository)은 분리되어 있으며, 이를 기반으로 본격적인 계층형 아키텍처(Layered Architecture)로 리팩토링하기 위한 실습용 자료로 활용됩니다.

## 🚀 기술 스택

- **Framework**: Express.js
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL
- **Language**: JavaScript (ES Modules)
- **Validation**: Zod
- **Auth**: JWT (자바스크립트 웹 토큰) & Bcrypt

## 📁 디렉토리 구조

```text
├── README.md                 # 프로젝트 개요 및 구조 설명 파일
├── env/                      # 환경 변수 파일 (.env) 디렉토리
├── eslint.config.js          # ESLint 설정 파일
├── jsconfig.json             # JavaScript 설정 (절대 경로 alias 등)
├── package.json              # 패키지 정보 및 스크립트
├── prisma/                   # Prisma 관련 설정 및 스키마
│   └── schema.prisma         # 데이터베이스 모델 정의
├── prisma.config.js          # Prisma 추가 설정
├── scripts/                  # 유틸리티 스크립트 (시드 데이터 등)
└── src/                      # 애플리케이션 메인 소스코드
    ├── config/               # 환경 변수 및 공통 설정 관리
    ├── constants/            # 에러 메시지, HTTP 상태 코드 등 상수 관리
    ├── db/                   # 데이터베이스 연결 관리 (Prisma Client)
    ├── exceptions/           # 커스텀 에러(예외) 클래스 정의
    ├── middlewares/          # Express 미들웨어 (에러 핸들러, 인증, 유효성 검사 등)
    ├── repository/           # 데이터 접근 로직 (DB 통신 담당)
    ├── routes/               # API 라우터 정의 (현재 비즈니스/프레젠테이션 로직 포함)
    │   ├── auth/             # 인증 관련 API (회원가입, 로그인 등)
    │   └── users/            # 사용자 관련 API (내 정보 조회 등)
    ├── utils/                # 유틸리티 함수 (비밀번호 해싱, JWT, Graceful Shutdown 등)
    └── server.js             # 애플리케이션 진입점 (Express 서버 설정 및 실행)
```
