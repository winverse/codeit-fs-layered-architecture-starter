import express from 'express';
import { db } from './prisma/db.js';
import { config } from '#config';
import { router as apiRouter } from './routes/index.js';
import cookieParser from 'cookie-parser';
import { errorHandler, cors } from '#middlewares';
import { setupGracefulShutdown } from './common/lifecycle/graceful-shutdown.js';

const app = express();

// JSON 파싱
app.use(express.json());

// 쿠키 파싱 (중요!)
app.use(cookieParser());

// cors
app.use(cors);

// API 라우터 등록
app.use('/api', apiRouter);

app.use(errorHandler);

const server = app.listen(config.PORT, (error) => {
  if (error) {
    console.error('애플리케이션 시작 실패:', error);
    process.exitCode = 1;
    return;
  }

  console.log(
    `[${config.NODE_ENV}] Server running at http://localhost:${config.PORT}`,
  );
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server, db);
