import { EXIT_CODE } from '#constants';

export const setupGracefulShutdown = (server, db) => {
  const shutdown = async (signal) => {
    console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);

    try {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('서버가 종료되었습니다.');

      await db.close();
      console.log('데이터베이스 연결이 종료되었습니다.');
      // 서버와 데이터베이스 연결을 모두 닫았으므로 정상 종료 코드로 끝냅니다.
      process.exit(EXIT_CODE.SUCCESS);
    } catch (error) {
      console.error('서버 또는 데이터베이스 종료 중 에러:', error);
      // 닫는 도중 오류가 났으므로 오류 종료 코드로 끝냅니다.
      process.exit(EXIT_CODE.FAILURE);
    }
  };

  // process.on(신호, 함수)는 운영체제가 보낸 종료 신호를 받으면 함수를 실행하도록 등록합니다.
  // SIGINT: 터미널에서 Ctrl + C를 누르면 보내는 종료 신호입니다.
  // SIGTERM: 다른 프로그램(kill 명령, 배포 도구 등)이 종료를 요청할 때 보내는 신호입니다.
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
