import express from 'express';
import { db } from '#prisma/db.js';
import { config } from '#config';
import { router as apiRouter } from './routes/index.js';
import cookieParser from 'cookie-parser';
import { errorHandler, cors } from '#middlewares';
import { setupGracefulShutdown } from './common/lifecycle/graceful-shutdown.js';

const app = express();

// 정적 파일 제공 (public 폴더)
app.use(express.static('public'));

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
    throw error;
  }

  console.log(
    `[${config.NODE_ENV}] Server running at http://localhost:${config.PORT}`,
  );
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server, db);
