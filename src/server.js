import express from 'express';
import { db } from '#prisma/db.js';
import { config } from '#config';
import { router as apiRouter } from './routes/index.js';
import cookieParser from 'cookie-parser';
import { errorHandler, cors } from '#middlewares';
import { setupGracefulShutdown } from './common/lifecycle/graceful-shutdown.js';

const app = express();

app.use(cors);
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRouter);
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  console.log(
    `[${config.NODE_ENV}] Server running at http://localhost:${config.PORT}`,
  );
});

// 종료 신호(SIGINT, SIGTERM)를 받으면 서버와 데이터베이스 연결을 닫도록 등록
setupGracefulShutdown(server, db);
